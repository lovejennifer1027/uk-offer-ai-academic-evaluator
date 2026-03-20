"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PageShell } from "@/components/page-shell";
import { ResultSummary } from "@/components/result-summary";
import { getLocalSubmissionById } from "@/lib/browser-history";
import type { SubmissionDetailApiResponse, SubmissionRecord } from "@/lib/types";

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSubmission() {
      const local = id ? getLocalSubmissionById(id) : null;

      try {
        setNotice(null);
        setError(null);

        if (local && !cancelled) {
          setSubmission(local);
        }

        const response = await fetch(`/api/submissions/${id}`, { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as
          | (SubmissionDetailApiResponse & { error?: string })
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "找不到这份评估报告。");
        }

        if (!cancelled) {
          const remoteSubmission = payload && "submission" in payload ? payload.submission : null;
          setSubmission(remoteSubmission);
        }
      } catch (loadError) {
        if (!cancelled) {
          if (local) {
            setSubmission(local);
            setNotice("服务器版本暂时无法加载，当前展示的是本地保存的报告。");
            setError(null);
          } else {
            setNotice(null);
            setError(loadError instanceof Error ? loadError.message : "暂时无法加载这份报告。");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      void loadSubmission();
    } else {
      setLoading(false);
      setError("缺少报告编号，无法打开该页面。");
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        {loading ? (
          <div role="status" aria-live="polite" className="hero-stage px-8 py-10 text-sm text-[var(--muted)]">
            正在加载评估报告...
          </div>
        ) : submission ? (
          <div className="space-y-6">
            {notice ? (
              <div
                role="status"
                className="rounded-[24px] border border-[rgba(183,146,79,0.18)] bg-[rgba(183,146,79,0.08)] px-5 py-4 text-sm text-[var(--navy)]"
              >
                {notice}
              </div>
            ) : null}
            <ResultSummary submission={submission} />
          </div>
        ) : (
          <div role="alert" className="hero-stage px-8 py-10">
            <h1 className="text-4xl text-[var(--navy)]">报告暂不可用</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              {error ?? "当前无法在 Supabase 或本地历史记录中找到这份报告。"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/evaluate" className="luxury-button text-sm">
                开始新的评估
              </Link>
              <Link href="/history" className="luxury-button-muted text-sm">
                查看历史记录
              </Link>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
