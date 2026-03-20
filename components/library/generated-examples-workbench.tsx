"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  AI_LIBRARY_SCORE_BANDS,
  AI_LIBRARY_SCORE_BAND_LABELS
} from "@/lib/ai-library/constants";
import {
  getGeneratedExampleHistory,
  saveGeneratedExampleToHistory
} from "@/lib/ai-library/browser-history";
import type { GeneratedExampleApiResponse, GeneratedExamplePack } from "@/lib/ai-library/types";
import {
  LIBRARY_ASSIGNMENT_TYPES,
  LIBRARY_ASSIGNMENT_TYPE_LABELS,
  LIBRARY_PROGRAMME_LEVELS,
  LIBRARY_PROGRAMME_LEVEL_LABELS
} from "@/lib/library/constants";
import { GeneratedExampleCard } from "@/components/library/generated-example-card";
import { formatDate } from "@/lib/utils";

const selectableProgrammeLevels = LIBRARY_PROGRAMME_LEVELS.filter((item) => item !== "unknown");
const selectableAssignmentTypes = LIBRARY_ASSIGNMENT_TYPES.filter((item) => item !== "unknown");

export function GeneratedExamplesWorkbench() {
  const [subject, setSubject] = useState("Law");
  const [programmeLevel, setProgrammeLevel] = useState<(typeof selectableProgrammeLevels)[number]>("masters");
  const [assignmentType, setAssignmentType] = useState<(typeof selectableAssignmentTypes)[number]>("dissertation");
  const [scoreBand, setScoreBand] = useState<(typeof AI_LIBRARY_SCORE_BANDS)[number]>("80+");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedExamplePack[]>([]);
  const [result, setResult] = useState<GeneratedExamplePack | null>(null);

  useEffect(() => {
    const initialHistory = getGeneratedExampleHistory();
    setHistory(initialHistory);
    setResult(initialHistory[0] ?? null);
  }, []);

  const historyCountLabel = useMemo(() => {
    if (history.length === 0) {
      return "还没有已积累的 AI 高分案例。";
    }

    return `当前浏览器内已积累 ${history.length} 组生成结果，可继续用于 insights 分析。`;
  }, [history]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/library/examples/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject,
          programme_level: programmeLevel,
          assignment_type: assignmentType,
          score_band: scoreBand,
          focus: focus.trim() || undefined
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | (GeneratedExampleApiResponse & { error?: string })
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("result" in payload)) {
        throw new Error(payload?.error ?? "暂时无法生成高分示例，请稍后重试。");
      }

      saveGeneratedExampleToHistory(payload.result);
      const nextHistory = getGeneratedExampleHistory();
      setHistory(nextHistory);
      setResult(payload.result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "暂时无法生成高分示例。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
      <section className="space-y-6 xl:sticky xl:top-28">
        <article className="modern-showcase p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow-pill text-sm font-semibold">AI 实时生成</span>
              <h2 className="mt-5 text-3xl text-[var(--navy)]">按一个清晰场景生成一组高分写作结果。</h2>
            </div>
            <span className="signal-status">
              <span className="signal-dot is-live" />
              Live prompt
            </span>
          </div>

          <p className="mt-5 text-sm leading-8 text-[var(--muted)]">
            这里不是公开来源库，而是 AI 实时生成的学习示例工作台。你可以现场生成高分示句、分析段落、表达模板和写法说明，再把结果积累起来供后续复盘与 insights 使用。
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <div className="mini-floating-card p-4">
              <div className="stat-tile-label">第一层</div>
              <div className="mt-2 text-base font-semibold text-[var(--navy)]">生成高分写法</div>
            </div>
            <div className="mini-floating-card p-4">
              <div className="stat-tile-label">第二层</div>
              <div className="mt-2 text-base font-semibold text-[var(--navy)]">保留本地积累</div>
            </div>
            <div className="mini-floating-card p-4">
              <div className="stat-tile-label">当前状态</div>
              <div className="mt-2 text-base font-semibold text-[var(--navy)]">{history.length} 组已保存</div>
            </div>
          </div>

          <div className="section-panel mt-6 rounded-[24px] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
            {historyCountLabel}
          </div>
        </article>

        <form onSubmit={handleSubmit} className="card-surface rounded-[36px] p-7 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow-pill text-sm font-semibold">输入条件</span>
              <h3 className="mt-5 text-2xl text-[var(--navy)]">先设定你想训练的写作场景。</h3>
            </div>
            <p className="max-w-xs text-sm leading-7 text-[var(--muted)]">
              建议一次只聚焦一个任务类型和一个分数段，这样结果会更清晰，也更容易比较。
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--navy)]">学科 / Subject</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="例如：Law、Education、Business Management"
                className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--navy)]">课程层级</span>
              <select
                value={programmeLevel}
                onChange={(event) => setProgrammeLevel(event.target.value as (typeof selectableProgrammeLevels)[number])}
                className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              >
                {selectableProgrammeLevels.map((option) => (
                  <option key={option} value={option}>
                    {LIBRARY_PROGRAMME_LEVEL_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--navy)]">作业类型</span>
              <select
                value={assignmentType}
                onChange={(event) => setAssignmentType(event.target.value as (typeof selectableAssignmentTypes)[number])}
                className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              >
                {selectableAssignmentTypes.map((option) => (
                  <option key={option} value={option}>
                    {LIBRARY_ASSIGNMENT_TYPE_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--navy)]">目标分数段</span>
              <select
                value={scoreBand}
                onChange={(event) => setScoreBand(event.target.value as (typeof AI_LIBRARY_SCORE_BANDS)[number])}
                className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              >
                {AI_LIBRARY_SCORE_BANDS.map((option) => (
                  <option key={option} value={option}>
                    {AI_LIBRARY_SCORE_BAND_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-[var(--navy)]">额外聚焦点（可选）</span>
            <input
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              placeholder="例如：critical analysis、literature review、discussion section"
              className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
            />
          </label>

          {error ? (
            <div className="mt-5 rounded-[24px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <button type="submit" className="luxury-button w-full text-sm" disabled={loading || !subject.trim()}>
              {loading ? "正在生成高分示例..." : "实时生成高分示例"}
            </button>
            <Link href="/library/insights" className="luxury-button-muted w-full text-center text-sm">
              用已积累样本继续分析
            </Link>
          </div>
        </form>

        <article className="card-surface rounded-[36px] p-7 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="eyebrow-pill text-sm font-semibold">积累层</span>
              <h3 className="mt-5 text-2xl text-[var(--navy)]">最近生成的示例会留在当前浏览器里。</h3>
            </div>
            <div className="rounded-[22px] border border-[var(--line)] bg-white/82 px-4 py-3 text-right text-xs text-[var(--muted)]">
              <div>最近保留</div>
              <div className="mt-2 text-base font-semibold text-[var(--navy)]">{Math.min(history.length, 6)} / 6</div>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-white/76 px-4 py-5 text-sm leading-7 text-[var(--muted)]">
              还没有已积累样本。先生成一组结果，系统会自动把它保存在当前浏览器里，方便你稍后继续比较和分析。
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {history.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setResult(item)}
                  className={`block w-full rounded-[24px] border px-4 py-4 text-left transition ${
                    result?.id === item.id
                      ? "border-[rgba(141,139,198,0.34)] bg-[rgba(255,255,255,0.98)] shadow-[0_14px_32px_rgba(67,84,120,0.08)]"
                      : "border-[var(--line)] bg-white hover:border-[rgba(141,139,198,0.24)]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--navy)]">{item.title}</p>
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        {item.subject} · {LIBRARY_PROGRAMME_LEVEL_LABELS[item.programme_level]} ·{" "}
                        {LIBRARY_ASSIGNMENT_TYPE_LABELS[item.assignment_type]} · {item.score_band}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--muted)]">{formatDate(item.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="space-y-6">
        {result ? (
          <>
            <article className="modern-showcase p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">结果阅读区</p>
                  <h2 className="mt-4 text-2xl text-[var(--navy)] md:text-3xl">先看顶部摘要，再读示句、段落和模板。</h2>
                </div>
                <span className="signal-status">
                  <span className="signal-dot is-live" />
                  Current selection
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="mini-floating-card p-4">
                  <div className="stat-tile-label">学科</div>
                  <div className="mt-2 text-base font-semibold text-[var(--navy)]">{result.subject}</div>
                </div>
                <div className="mini-floating-card p-4">
                  <div className="stat-tile-label">层级</div>
                  <div className="mt-2 text-base font-semibold text-[var(--navy)]">
                    {LIBRARY_PROGRAMME_LEVEL_LABELS[result.programme_level]}
                  </div>
                </div>
                <div className="mini-floating-card p-4">
                  <div className="stat-tile-label">类型</div>
                  <div className="mt-2 text-base font-semibold text-[var(--navy)]">
                    {LIBRARY_ASSIGNMENT_TYPE_LABELS[result.assignment_type]}
                  </div>
                </div>
                <div className="mini-floating-card p-4">
                  <div className="stat-tile-label">目标分数段</div>
                  <div className="mt-2 text-base font-semibold text-[var(--navy)]">{result.score_band}</div>
                </div>
              </div>
            </article>

            <GeneratedExampleCard example={result} />
          </>
        ) : (
          <article className="hero-stage px-8 py-10 md:px-10 md:py-12">
            <span className="eyebrow-pill text-sm font-semibold">结果预览</span>
            <h2 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">这里会显示你刚生成的高分示句与段落模板。</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">
              生成后你会看到示句、段落示例、表达模板、分析说明和使用提醒。所有内容都属于 AI 生成的学习示例，不会冒充真实大学官方材料。
            </p>
          </article>
        )}
      </section>
    </div>
  );
}
