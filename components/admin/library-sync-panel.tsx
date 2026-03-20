"use client";

import { useEffect, useState } from "react";

import type { LibraryStatusSummary } from "@/lib/library/types";

interface LibrarySyncPanelProps {
  initialStatus: LibraryStatusSummary;
}

interface LiveEvent {
  timestamp: string;
  status?: LibraryStatusSummary;
  error?: string;
}

export function LibrarySyncPanel({ initialStatus }: LibrarySyncPanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/admin/library/live-events");

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as LiveEvent;
        if (payload.status) {
          setStatus(payload.status);
        }
        setEvents((current) => [payload, ...current].slice(0, 8));
      } catch {
        return;
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  async function runSync() {
    setError(null);
    setMessage(null);
    setSyncing(true);

    try {
      const response = await fetch("/api/admin/library/sync-now", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          trigger_type: "manual",
          created_by: "admin-ui"
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; result?: { crawl_run_id?: string } } | null;

      if (!response.ok) {
        setError(payload?.error ?? "启动同步失败。");
        return;
      }

      setMessage(`同步已触发，run id：${payload?.result?.crawl_run_id ?? "unknown"}`);
    } finally {
      setSyncing(false);
    }
  }

  async function rebuildAllEmbeddings() {
    setError(null);
    setMessage(null);
    setRebuilding(true);

    try {
      const response = await fetch("/api/admin/library/rebuild-embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          limit: 50
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; result?: { rebuilt?: number } } | null;

      if (!response.ok) {
        setError(payload?.error ?? "重建 embeddings 失败。");
        return;
      }

      setMessage(`Embeddings 重建完成，共处理 ${payload?.result?.rebuilt ?? 0} 个实体。`);
    } finally {
      setRebuilding(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">最近同步</p>
          <p className="mt-3 text-lg text-[var(--navy)]">{status.latest_sync_at ? new Date(status.latest_sync_at).toLocaleString("zh-CN") : "暂无"}</p>
        </article>
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">已检查页面</p>
          <p className="mt-3 text-2xl text-[var(--navy)]">{status.pages_checked}</p>
        </article>
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">变更页面</p>
          <p className="mt-3 text-2xl text-[var(--navy)]">{status.changed_pages}</p>
        </article>
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">新增样本</p>
          <p className="mt-3 text-2xl text-[var(--navy)]">{status.new_examples}</p>
        </article>
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">更新评分标准</p>
          <p className="mt-3 text-2xl text-[var(--navy)]">{status.updated_rubrics}</p>
        </article>
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">失败任务</p>
          <p className="mt-3 text-2xl text-[var(--navy)]">{status.failed_jobs}</p>
        </article>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => void runSync()} className="luxury-button text-sm" disabled={syncing}>
          {syncing ? "同步中..." : "立即同步"}
        </button>
        <button type="button" onClick={() => void rebuildAllEmbeddings()} className="luxury-button-muted text-sm" disabled={rebuilding}>
          {rebuilding ? "重建中..." : "重建 Embeddings"}
        </button>
      </div>

      {message ? <div className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--navy)]">{message}</div> : null}
      {error ? <div className="rounded-[24px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">{error}</div> : null}

      <section className="card-surface rounded-[34px] p-6">
        <h2 className="text-2xl text-[var(--navy)]">实时进度</h2>
        <div className="mt-5 space-y-3">
          {events.length === 0 ? (
            <div className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
              正在等待后台事件流...
            </div>
          ) : (
            events.map((event) => (
              <div key={event.timestamp} className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--navy)]">{new Date(event.timestamp).toLocaleString("zh-CN")}</span>
                {event.error ? (
                  <> 后台状态流返回错误：{event.error}</>
                ) : (
                  <>
                    {" "}
                    已更新状态：已检查 {event.status?.pages_checked ?? 0}，变更 {event.status?.changed_pages ?? 0}，失败 {event.status?.failed_jobs ?? 0}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
