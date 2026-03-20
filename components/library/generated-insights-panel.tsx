"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AI_LIBRARY_MAX_CONTEXT_ITEMS, AI_LIBRARY_SCORE_BANDS } from "@/lib/ai-library/constants";
import { getGeneratedExampleHistory } from "@/lib/ai-library/browser-history";
import type {
  GeneratedExamplePack,
  GeneratedInsightAnswer,
  GeneratedInsightContextItem
} from "@/lib/ai-library/types";
import {
  LIBRARY_ASSIGNMENT_TYPES,
  LIBRARY_ASSIGNMENT_TYPE_LABELS,
  LIBRARY_PROGRAMME_LEVELS,
  LIBRARY_PROGRAMME_LEVEL_LABELS
} from "@/lib/library/constants";

const exampleQuestions = [
  "80+ dissertation 最常见的结构优势是什么？",
  "这些高分示例里，批判性分析通常怎么展开？",
  "如果目标是 70-79，哪些表达方式最值得优先练习？"
];

const selectableProgrammeLevels = LIBRARY_PROGRAMME_LEVELS.filter((item) => item !== "unknown");
const selectableAssignmentTypes = LIBRARY_ASSIGNMENT_TYPES.filter((item) => item !== "unknown");

function buildInsightContextItem(example: GeneratedExamplePack): GeneratedInsightContextItem {
  const paragraphExcerpt = example.paragraph_example.paragraph.slice(0, 260);
  const sentenceExcerpt = example.example_sentences[0]?.sentence ?? "";
  const exampleExcerpt = sentenceExcerpt || paragraphExcerpt;

  return {
    id: example.id,
    title: example.title,
    subject: example.subject,
    programme_level: example.programme_level,
    assignment_type: example.assignment_type,
    score_band: example.score_band,
    overview: example.overview,
    example_excerpt: exampleExcerpt
  };
}

export function GeneratedInsightsPanel() {
  const [query, setQuery] = useState(exampleQuestions[0]);
  const [subject, setSubject] = useState("");
  const [programmeLevel, setProgrammeLevel] = useState("");
  const [assignmentType, setAssignmentType] = useState("");
  const [scoreBand, setScoreBand] = useState("");
  const [history, setHistory] = useState<GeneratedExamplePack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedInsightAnswer | null>(null);

  useEffect(() => {
    setHistory(getGeneratedExampleHistory());
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (subject.trim() && !item.subject.toLowerCase().includes(subject.trim().toLowerCase())) {
        return false;
      }

      if (programmeLevel && item.programme_level !== programmeLevel) {
        return false;
      }

      if (assignmentType && item.assignment_type !== assignmentType) {
        return false;
      }

      if (scoreBand && item.score_band !== scoreBand) {
        return false;
      }

      return true;
    });
  }, [assignmentType, history, programmeLevel, scoreBand, subject]);

  const contextItems = useMemo(
    () => filteredHistory.slice(0, AI_LIBRARY_MAX_CONTEXT_ITEMS).map(buildInsightContextItem),
    [filteredHistory]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (contextItems.length === 0) {
      setError("当前筛选条件下还没有可分析的已积累样本，请先去生成一些高分示例。");
      return;
    }

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
          subject: subject.trim() || undefined,
          programme_level: programmeLevel || undefined,
          assignment_type: assignmentType || undefined,
          score_band: scoreBand || undefined,
          generated_examples: contextItems
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | { result?: GeneratedInsightAnswer; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "暂时无法生成分析结果。");
      }

      setResult(payload?.result ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "暂时无法生成分析结果。");
    } finally {
      setLoading(false);
    }
  }

  if (history.length === 0) {
    return (
      <div className="card-surface rounded-[36px] p-8 md:p-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
          <div className="reading-column">
            <span className="eyebrow-pill text-sm font-semibold">积累式分析</span>
            <h2 className="mt-5 text-3xl text-[var(--navy)]">先生成一些高分示例，再回来做模式分析。</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
              这里的 insights 会基于你已经生成并保存在当前浏览器内的高分样本来总结写作规律。现在还没有可分析的样本，所以先去生成几组结果会更合适。
            </p>
            <div className="mt-7">
              <Link href="/library/examples" className="luxury-button text-sm">
                先去生成高分示例
              </Link>
            </div>
          </div>

          <aside className="section-panel rounded-[28px] p-6">
            <div className="stat-tile">
              <div className="stat-tile-label">当前状态</div>
              <div className="stat-tile-value">还没有可用于分析的本地积累样本</div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              先在高分示例页生成几组不同条件的案例，再回来问“80+ 常见优势是什么”这类问题，回答会更有层次。
            </p>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
      <section className="space-y-6">
        <article className="card-surface rounded-[36px] p-7 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="reading-column">
              <span className="eyebrow-pill text-sm font-semibold">AI-generated insights</span>
              <h2 className="mt-5 text-3xl text-[var(--navy)]">基于你已积累的 AI 高分示例，继续做写作模式分析。</h2>
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-white/82 px-4 py-3 text-right text-xs text-[var(--muted)]">
              可分析样本
              <div className="mt-2 text-base font-semibold text-[var(--navy)]">{filteredHistory.length}</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
            这里不会调用真实大学案例库，而是先读取你在示例页积累的 AI 生成案例，再对这些案例做受控综合，所以更适合复盘“哪些表达和结构反复出现”。
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="stat-tile">
              <div className="stat-tile-label">样本来源</div>
              <div className="stat-tile-value">当前浏览器内已积累结果</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-label">提交上限</div>
              <div className="stat-tile-value">最近 {AI_LIBRARY_MAX_CONTEXT_ITEMS} 条</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-label">分析方式</div>
              <div className="stat-tile-value">基于样本综合，不做无依据扩写</div>
            </div>
          </div>
        </article>

        <article className="card-surface rounded-[36px] p-7 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow-pill text-sm font-semibold">快速提问</span>
              <h3 className="mt-4 text-2xl text-[var(--navy)]">先用这些问题进入分析节奏。</h3>
            </div>
            <p className="max-w-xs text-sm leading-7 text-[var(--muted)]">
              这些只是起点。你也可以把问题改成更具体的“70+ 的文献综述为什么不够像 80+？”这种形式。
            </p>
          </div>
          <div className="mt-4 space-y-3">
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
        </article>
      </section>

      <section className="card-surface rounded-[36px] p-7 md:p-8 xl:sticky xl:top-28">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow-pill text-sm font-semibold">分析工作台</span>
              <h3 className="mt-4 text-2xl text-[var(--navy)]">先筛选，再提问，再读回答引用。</h3>
            </div>
            <p className="max-w-xs text-sm leading-7 text-[var(--muted)]">
              如果你希望回答更稳定，建议把筛选条件收窄，让一组问题只分析一个清晰场景。
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">问题</span>
            <textarea
              rows={5}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--navy)]">学科筛选（可选）</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="例如：Law"
                className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--navy)]">目标分数段（可选）</span>
              <select
                value={scoreBand}
                onChange={(event) => setScoreBand(event.target.value)}
                className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              >
                <option value="">全部分数段</option>
                {AI_LIBRARY_SCORE_BANDS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--navy)]">课程层级（可选）</span>
              <select
                value={programmeLevel}
                onChange={(event) => setProgrammeLevel(event.target.value)}
                className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              >
                <option value="">全部层级</option>
                {selectableProgrammeLevels.map((option) => (
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
                {selectableAssignmentTypes.map((option) => (
                  <option key={option} value={option}>
                    {LIBRARY_ASSIGNMENT_TYPE_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="luxury-button w-full text-sm" disabled={loading || !query.trim()}>
            {loading ? "正在生成分析..." : "分析已积累示例"}
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
              <ul className="editorial-list mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                {result.key_points.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="surface-inset rounded-[26px] p-5">
              <h3 className="text-xl text-[var(--navy)]">使用提醒</h3>
              <ul className="editorial-list mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                {result.caveats.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="surface-inset rounded-[26px] p-5">
              <h3 className="text-xl text-[var(--navy)]">引用到的已积累样本</h3>
              <div className="mt-3 space-y-3">
                {result.evidence.map((item) => (
                  <div
                    key={`${item.example_id}-${item.title}`}
                    className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]"
                  >
                    <span className="font-semibold text-[var(--navy)]">{item.title}</span>
                    <span className="mt-2 block text-xs text-[var(--muted)]">{item.subject} · {item.score_band}</span>
                    <span className="mt-3 block">{item.excerpt}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        ) : null}
      </section>
    </div>
  );
}
