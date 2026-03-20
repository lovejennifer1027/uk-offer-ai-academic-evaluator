"use client";

import { useState } from "react";

import { LIBRARY_NORMALIZATION_STATUS_LABELS } from "@/lib/library/constants";
import type { NormalizationRunRecord, PaginatedResult } from "@/lib/library/types";

interface NormalizationManagerProps {
  initialResult: PaginatedResult<NormalizationRunRecord>;
}

interface RetryPayload {
  error?: string;
  items?: NormalizationRunRecord[];
  processed?: {
    completed?: number;
    failed?: number;
    ignored?: number;
    queued?: number;
  } | null;
}

export function NormalizationManager({ initialResult }: NormalizationManagerProps) {
  const [result, setResult] = useState(initialResult);
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  async function refresh(page = result.page, nextStatus = statusFilter) {
    setError(null);
    const url = new URL("/api/admin/normalization-runs", window.location.origin);
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", "20");

    if (nextStatus) {
      url.searchParams.set("status", nextStatus);
    }

    const response = await fetch(url.toString(), { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as PaginatedResult<NormalizationRunRecord> & { error?: string };

    if (!response.ok || !Array.isArray(payload.items)) {
      setError(payload?.error ?? "加载归一化列表失败。");
      return;
    }

    setResult(payload);
  }

  async function retryRuns(ids?: string[]) {
    setError(null);
    setMessage(null);
    setRetrying(true);

    try {
      const response = await fetch("/api/admin/normalization-runs/retry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ids,
          status: ids?.length ? undefined : "failed",
          process_now: true
        })
      });
      const payload = (await response.json().catch(() => null)) as RetryPayload | null;

      if (!response.ok) {
        setError(payload?.error ?? "重试失败。");
        return;
      }

      const processed = payload?.processed;
      setMessage(
        `已重新提交 ${payload?.items?.length ?? 0} 个任务。完成 ${processed?.completed ?? 0}，失败 ${processed?.failed ?? 0}，忽略 ${processed?.ignored ?? 0}。`
      );
      await refresh(1, statusFilter);
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="space-y-6">
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
            全部任务
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("queued");
              void refresh(1, "queued");
            }}
            className="luxury-button-muted text-sm"
          >
            待处理
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("failed");
              void refresh(1, "failed");
            }}
            className="luxury-button-muted text-sm"
          >
            仅失败任务
          </button>
        </div>
        <button type="button" onClick={() => void retryRuns()} className="luxury-button text-sm" disabled={retrying}>
          {retrying ? "重试中..." : "重试失败任务"}
        </button>
      </div>

      {message ? <div className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--navy)]">{message}</div> : null}
      {error ? <div className="rounded-[24px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">{error}</div> : null}

      {result.items.length === 0 ? (
        <div className="card-surface rounded-[32px] p-6 text-sm text-[var(--muted)]">当前筛选条件下还没有归一化任务。</div>
      ) : (
        <div className="space-y-4">
          {result.items.map((item) => (
            <article key={item.id} className="card-surface rounded-[32px] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--gold)]">{LIBRARY_NORMALIZATION_STATUS_LABELS[item.status]}</p>
                  <h3 className="mt-2 text-xl text-[var(--navy)]">{item.model_name ?? "未记录模型"}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    Prompt 版本：{item.prompt_version ?? "unknown"}，输入 tokens：{item.input_tokens ?? 0}，输出 tokens：{item.output_tokens ?? 0}
                  </p>
                </div>
                <div className="text-sm text-[var(--muted)]">{new Date(item.created_at).toLocaleString("zh-CN")}</div>
              </div>

              {item.error_log ? (
                <div className="mt-4 rounded-[22px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">
                  {item.error_log}
                </div>
              ) : null}

              <details className="mt-4 rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
                <summary className="cursor-pointer font-semibold text-[var(--navy)]">查看原始模型响应</summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap leading-7">
                  {JSON.stringify(item.raw_model_response ?? {}, null, 2)}
                </pre>
              </details>

              {item.status === "failed" ? (
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={() => void retryRuns([item.id])} className="luxury-button-muted text-sm" disabled={retrying}>
                    重新执行此任务
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {result.page_count > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--line)] bg-white/76 px-5 py-4 text-sm text-[var(--muted)]">
          <span>
            第 {result.page} / {result.page_count} 页，共 {result.total} 条任务
          </span>
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
