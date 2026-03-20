"use client";

import { useState } from "react";

import {
  LIBRARY_ASSIGNMENT_TYPES,
  LIBRARY_ASSIGNMENT_TYPE_LABELS,
  LIBRARY_PROGRAMME_LEVELS,
  LIBRARY_PROGRAMME_LEVEL_LABELS
} from "@/lib/library/constants";
import type { LibraryInsightAnswer, UniversityRecord } from "@/lib/library/types";

interface InsightsQueryPanelProps {
  universities: UniversityRecord[];
}

const exampleQuestions = [
  "80+ 英国 dissertation 常见优势是什么？",
  "70+ 和 80+ descriptor 的差异通常体现在哪里？",
  "Leeds Law 高分 dissertation 有哪些共同模式？"
];

export function InsightsQueryPanel({ universities }: InsightsQueryPanelProps) {
  const [query, setQuery] = useState(exampleQuestions[0]);
  const [universityId, setUniversityId] = useState("");
  const [programmeLevel, setProgrammeLevel] = useState("");
  const [assignmentType, setAssignmentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LibraryInsightAnswer | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/library/insights/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query,
          university_id: universityId || undefined,
          programme_level: programmeLevel || undefined,
          assignment_type: assignmentType || undefined
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | { result?: LibraryInsightAnswer; answer?: LibraryInsightAnswer; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "暂时无法生成 insights。");
      }

      setResult(payload?.result ?? payload?.answer ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "暂时无法生成 insights。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="card-surface rounded-[36px] p-7 md:p-8">
        <span className="eyebrow-pill text-sm font-semibold">来源证据洞察</span>
        <h2 className="mt-5 text-3xl text-[var(--navy)]">基于库内证据提问，而不是让模型凭空猜测。</h2>
        <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
          系统会先检索 examples、rubrics 和 feedback patterns，再用受限上下文生成回答。
        </p>

        <div className="mt-6 space-y-3">
          {exampleQuestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="block w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-left text-sm text-[var(--muted)] transition hover:border-[rgba(141,139,198,0.24)] hover:text-[var(--navy)]"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="card-surface rounded-[36px] p-7 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">问题</span>
            <textarea
              rows={5}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">按大学筛选（可选）</span>
            <select
              value={universityId}
              onChange={(event) => setUniversityId(event.target.value)}
              className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
            >
              <option value="">全部大学</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--navy)]">课程层级（可选）</span>
              <select
                value={programmeLevel}
                onChange={(event) => setProgrammeLevel(event.target.value)}
                className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              >
                <option value="">全部层级</option>
                {LIBRARY_PROGRAMME_LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {LIBRARY_PROGRAMME_LEVEL_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--navy)]">作业类型（可选）</span>
              <select
                value={assignmentType}
                onChange={(event) => setAssignmentType(event.target.value)}
                className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              >
                <option value="">全部作业类型</option>
                {LIBRARY_ASSIGNMENT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {LIBRARY_ASSIGNMENT_TYPE_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="luxury-button w-full text-sm" disabled={loading || !query.trim()}>
            {loading ? "正在生成 insights..." : "生成回答"}
          </button>
        </form>

        {error ? (
          <div className="mt-5 rounded-[24px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="mt-7 space-y-5">
            <article className="surface-inset rounded-[26px] p-5">
              <h3 className="text-xl text-[var(--navy)]">回答</h3>
              <p className="mt-3 text-sm leading-8 text-[var(--muted)]">{result.answer}</p>
            </article>

            <article className="surface-inset rounded-[26px] p-5">
              <h3 className="text-xl text-[var(--navy)]">关键点</h3>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                {result.key_points.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="surface-inset rounded-[26px] p-5">
              <h3 className="text-xl text-[var(--navy)]">使用提醒</h3>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                {result.caveats.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="surface-inset rounded-[26px] p-5">
              <h3 className="text-xl text-[var(--navy)]">证据来源</h3>
              <div className="mt-3 space-y-3">
                {result.evidence.length === 0 ? (
                  <div className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                    当前没有足够的来源证据可展示。
                  </div>
                ) : (
                  result.evidence.map((item) => (
                    <a
                      key={`${item.entity_id}-${item.source_url}`}
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-[22px] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)] transition hover:border-[rgba(141,139,198,0.24)]"
                    >
                      <span className="font-semibold text-[var(--navy)]">{item.university_name} / {item.title}</span>
                      <span className="mt-2 block">{item.excerpt}</span>
                    </a>
                  ))
                )}
              </div>
            </article>
          </div>
        ) : null}
      </section>
    </div>
  );
}
