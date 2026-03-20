"use client";

import { useState } from "react";

import { LIBRARY_CRAWL_STATUS_LABELS } from "@/lib/library/constants";
import type { CrawlRunRecord, PaginatedResult } from "@/lib/library/types";

interface CrawlsManagerProps {
  initialResult: PaginatedResult<CrawlRunRecord>;
}

export function CrawlsManager({ initialResult }: CrawlsManagerProps) {
  const [result, setResult] = useState(initialResult);
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function refresh(page = result.page, nextStatus = statusFilter) {
    setError(null);
    const url = new URL("/api/admin/crawls", window.location.origin);
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", "20");

    if (nextStatus) {
      url.searchParams.set("status", nextStatus);
    }

    const response = await fetch(url.toString(), { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as PaginatedResult<CrawlRunRecord> & { error?: string };

    if (!response.ok || !Array.isArray(payload.items)) {
      setError(payload?.error ?? "加载抓取历史失败。");
      return;
    }

    setResult(payload);
  }

  async function runSync() {
    setError(null);
    setMessage("正在启动全库同步...");
    setRunning(true);

    try {
      const response = await fetch("/api/admin/crawls/run", {
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
      await refresh(1, statusFilter);
    } finally {
      setRunning(false);
    }
  }

  const latest = result.items[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">最近状态</p>
          <p className="mt-3 text-2xl text-[var(--navy)]">{latest ? LIBRARY_CRAWL_STATUS_LABELS[latest.status] : "暂无"}</p>
        </article>
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">已检查页面</p>
          <p className="mt-3 text-2xl text-[var(--navy)]">{latest?.pages_checked ?? 0}</p>
        </article>
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">新增 / 更新</p>
          <p className="mt-3 text-2xl text-[var(--navy)]">{(latest?.pages_new ?? 0) + (latest?.pages_updated ?? 0)}</p>
        </article>
        <article className="card-surface rounded-[28px] p-5">
          <p className="text-sm font-semibold text-[var(--gold)]">失败数</p>
          <p className="mt-3 text-2xl text-[var(--navy)]">{latest?.pages_failed ?? 0}</p>
        </article>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[var(--muted)]">运行全库同步会按 active sources 逐个抓取，并继续处理 normalization 队列。</div>
        <button type="button" onClick={() => void runSync()} className="luxury-button text-sm" disabled={running}>
          {running ? "同步中..." : "运行同步"}
        </button>
      </div>

      <section className="card-surface rounded-[32px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("");
                void refresh(1, "");
              }}
              className="luxury-button-muted text-sm"
            >
              全部记录
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("failed");
                void refresh(1, "failed");
              }}
              className="luxury-button-muted text-sm"
            >
              仅失败
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("running");
                void refresh(1, "running");
              }}
              className="luxury-button-muted text-sm"
            >
              运行中
            </button>
          </div>
          <div className="text-sm text-[var(--muted)]">
            第 {result.page} / {result.page_count} 页，共 {result.total} 条
          </div>
        </div>
      </section>

      {message ? <div className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--navy)]">{message}</div> : null}
      {error ? <div className="rounded-[24px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">{error}</div> : null}

      {result.items.length === 0 ? (
        <div className="card-surface rounded-[32px] p-6 text-sm text-[var(--muted)]">当前筛选条件下还没有抓取记录。</div>
      ) : (
        <div className="space-y-4">
          {result.items.map((item) => (
            <article key={item.id} className="card-surface rounded-[32px] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--gold)]">{item.trigger_type}</p>
                  <h3 className="mt-2 text-2xl text-[var(--navy)]">{LIBRARY_CRAWL_STATUS_LABELS[item.status]}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    已检查 {item.pages_checked} 页，新增 {item.pages_new}，更新 {item.pages_updated}，失败 {item.pages_failed}。
                  </p>
                  {item.created_by ? <p className="mt-2 text-xs text-[var(--muted)]">触发人：{item.created_by}</p> : null}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {item.started_at ? `开始：${new Date(item.started_at).toLocaleString("zh-CN")}` : "未开始"}
                  {item.finished_at ? <div className="mt-1">结束：{new Date(item.finished_at).toLocaleString("zh-CN")}</div> : null}
                </div>
              </div>
              {item.error_log ? (
                <details className="mt-4 rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
                  <summary className="cursor-pointer font-semibold text-[var(--navy)]">查看失败日志</summary>
                  <p className="mt-3 whitespace-pre-wrap leading-7">{item.error_log}</p>
                </details>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {result.page_count > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--line)] bg-white/76 px-5 py-4 text-sm text-[var(--muted)]">
          <span>浏览抓取历史分页</span>
          <div className="flex gap-3">
            {result.page > 1 ? (
              <button type="button" onClick={() => void refresh(result.page - 1, statusFilter)} className="luxury-button-muted text-sm">
                上一页
              </button>
            ) : null}
            {result.page < result.page_count ? (
              <button type="button" onClick={() => void refresh(result.page + 1, statusFilter)} className="luxury-button text-sm">
                下一页
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
