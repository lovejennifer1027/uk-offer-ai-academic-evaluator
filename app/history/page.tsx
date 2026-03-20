"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { formatDate } from "@/lib/utils";
import { getLocalSubmissionHistory, mergeSubmissions } from "@/lib/browser-history";
import type { SubmissionListApiResponse, SubmissionRecord } from "@/lib/types";

function getSourceLabel(source: SubmissionRecord["source"]) {
  if (source === "supabase") {
    return "云端";
  }

  if (source === "sample") {
    return "示例";
  }

  return "本地";
}

export default function HistoryPage() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSubmissions() {
      try {
        const local = getLocalSubmissionHistory();
        setNotice(null);
        setError(null);
        const response = await fetch("/api/submissions?limit=12", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as
          | (SubmissionListApiResponse & { error?: string })
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "暂时无法加载历史记录。");
        }

        if (!cancelled) {
          const remoteSubmissions = payload && "submissions" in payload ? payload.submissions ?? [] : [];
          setSubmissions(mergeSubmissions(remoteSubmissions, local));
        }
      } catch (loadError) {
        if (!cancelled) {
          const local = getLocalSubmissionHistory();
          setSubmissions(local);

          if (local.length > 0) {
            setNotice("服务器历史记录暂时不可用，当前展示的是本地已保存的报告。");
            setError(null);
          } else {
            setNotice(null);
            setError(loadError instanceof Error ? loadError.message : "暂时无法加载历史记录。");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSubmissions();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
          <div className="max-w-4xl">
            <span className="eyebrow-pill text-sm font-semibold">历史记录</span>
            <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">查看之前生成的学术评估报告。</h1>
            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              配置 Supabase 后，历史记录会保存在云端；本地也会同步保存一份，方便测试与预览。即使数据库尚未配置，页面也会展示示例记录。
            </p>
          </div>

          <div className="card-surface rounded-[38px] p-7 md:p-8">
            <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">记录说明</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              这一页会优先加载云端历史记录；如果服务暂时不可用，也会回退到本地保存的报告，保证你依然可以打开已生成的结果。
            </p>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-8 rounded-[24px] border border-[rgba(160,38,38,0.15)] bg-[rgba(160,38,38,0.05)] px-5 py-4 text-sm text-[#8b1e1e]"
          >
            {error}
          </div>
        ) : null}

        {notice ? (
          <div
            role="status"
            className="mt-8 rounded-[24px] border border-[rgba(183,146,79,0.18)] bg-[rgba(183,146,79,0.08)] px-5 py-4 text-sm text-[var(--navy)]"
          >
            {notice}
          </div>
        ) : null}

        <div className="mt-8 space-y-5">
          {loading ? (
            <div role="status" aria-live="polite" className="card-surface rounded-[34px] p-8 text-sm text-[var(--muted)]">
              正在加载历史记录...
            </div>
          ) : submissions.length === 0 ? (
            <div className="card-surface rounded-[38px] p-8">
              <h2 className="text-2xl text-[var(--navy)]">还没有评估记录</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                当你完成第一次论文评估后，报告会自动出现在这里，方便后续查看。
              </p>
              <Link href="/evaluate" className="luxury-button mt-6 text-sm">
                开始第一次评估
              </Link>
            </div>
          ) : (
            submissions.map((submission) => (
              <article key={submission.id} className="card-surface rounded-[38px] p-7 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[rgba(141,139,198,0.1)] px-3 py-1 text-xs font-semibold text-[var(--navy)]">
                        {getSourceLabel(submission.source)}
                      </span>
                      <span className="text-sm text-[var(--muted)]">{formatDate(submission.createdAt)}</span>
                    </div>
                    <h2 className="mt-4 text-3xl text-[var(--navy)]">{submission.essayTitle}</h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{submission.essayTextPreview}</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{submission.briefPreview}</p>
                  </div>

                  <div className="flex min-w-[180px] flex-col items-start gap-4 md:items-end">
                    <div className="rounded-[26px] border border-[rgba(141,139,198,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,244,252,0.94))] px-5 py-4 text-right">
                      <p className="text-sm font-semibold text-[var(--gold)]">总分</p>
                      <p className="mt-2 text-4xl font-semibold text-[var(--navy)]">
                        {submission.report.overall_score}/{submission.report.max_score}
                      </p>
                    </div>
                    <Link
                      href={`/results/${submission.id}`}
                      className="luxury-button text-sm"
                    >
                      打开报告
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}
