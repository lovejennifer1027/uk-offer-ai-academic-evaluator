import Link from "next/link";

import { ScoreCard } from "@/components/score-card";
import { formatDate } from "@/lib/utils";
import type { SubmissionRecord } from "@/lib/types";

interface ResultSummaryProps {
  submission: SubmissionRecord;
}

function getSourceLabel(source: SubmissionRecord["source"]) {
  if (source === "supabase") {
    return "云端";
  }

  if (source === "sample") {
    return "示例";
  }

  return "本地";
}

export function ResultSummary({ submission }: ResultSummaryProps) {
  const cards = [
    {
      label: "结构",
      score: submission.report.rubric_scores.Structure.score,
      scale: submission.report.rubric_scores.Structure.max
    },
    {
      label: "批判性思维",
      score: submission.report.rubric_scores["Critical Thinking"].score,
      scale: submission.report.rubric_scores["Critical Thinking"].max
    },
    {
      label: "文献使用",
      score: submission.report.rubric_scores["Use of Literature"].score,
      scale: submission.report.rubric_scores["Use of Literature"].max
    },
    {
      label: "引用规范",
      score: submission.report.rubric_scores.Referencing.score,
      scale: submission.report.rubric_scores.Referencing.max
    },
    {
      label: "语言表达",
      score: submission.report.rubric_scores.Language.score,
      scale: submission.report.rubric_scores.Language.max
    }
  ];

  return (
    <div className="space-y-9">
      <section className="card-surface relative overflow-hidden rounded-[42px] p-8 md:p-11">
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(160,189,229,0.16),transparent)]" />
        <div className="relative grid gap-7 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
          <div>
            <span className="eyebrow-pill text-sm font-semibold">形成性学术评估报告</span>
            <h1 className="mt-6 max-w-4xl text-4xl text-[var(--navy)] md:text-5xl">{submission.essayTitle}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)]">
              评估时间：{formatDate(submission.createdAt)}。当前采用「{submission.rubricLabel}」评分框架，并按 UK Offer 国际教育的学术评估流程输出。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="quiet-badge">优先遵循老师要求</span>
              <span className="quiet-badge">服务端结构化评分</span>
              <span className="quiet-badge">形成性反馈，非官方成绩</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <article className="dark-panel rounded-[34px] p-7 text-white sm:col-span-2">
              <p className="text-sm font-semibold text-[var(--gold-soft)]">总分</p>
              <p className="mt-4 text-6xl font-semibold">
                {submission.report.overall_score}
                <span className="ml-2 text-xl font-medium text-white/52">/ {submission.report.max_score}</span>
              </p>
              <div className="gold-rule my-6" />
              <p className="text-sm leading-7 text-white/70">{submission.report.disclaimer}</p>
            </article>

            <article className="surface-inset rounded-[30px] p-5">
              <p className="text-sm font-semibold text-[var(--gold)]">评分模板</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{submission.rubricLabel}</p>
            </article>

            <article className="surface-inset rounded-[30px] p-5">
              <p className="text-sm font-semibold text-[var(--gold)]">记录来源</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{getSourceLabel(submission.source)}</p>
            </article>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">评分拆解</p>
            <h2 className="mt-3 text-2xl text-[var(--navy)] md:text-4xl">五个维度，清楚看到论文表现落点。</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <ScoreCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="card-surface rounded-[38px] p-8 md:p-10">
          <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">总体反馈</p>
          <p className="mt-5 text-base leading-8 text-[var(--ink)]">{submission.report.overall_feedback}</p>

          <div className="soft-divider my-8" />

          <div className="grid gap-5 md:grid-cols-2">
            <section className="surface-inset rounded-[30px] p-6">
              <h3 className="text-2xl text-[var(--navy)]">优点</h3>
              <ul className="mt-4 space-y-3 text-sm leading-8 text-[var(--muted)]">
                {submission.report.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="surface-inset rounded-[30px] p-6">
              <h3 className="text-2xl text-[var(--navy)]">不足</h3>
              <ul className="mt-4 space-y-3 text-sm leading-8 text-[var(--muted)]">
                {submission.report.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="card-surface rounded-[38px] p-8">
            <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">修改重点</p>
            <h3 className="mt-3 text-2xl text-[var(--navy)] md:text-3xl">下一版优先改哪里</h3>
            <ul className="mt-5 space-y-3 text-sm leading-8 text-[var(--muted)]">
              {submission.report.suggestions_for_improvement.map((item) => (
                <li key={item} className="rounded-[24px] bg-[rgba(141,139,198,0.08)] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="card-surface rounded-[38px] p-8">
            <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">评估说明</p>
            <div className="mt-4 space-y-3 text-sm leading-8 text-[var(--muted)]">
              <div className="rounded-[24px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,247,252,0.92))] px-4 py-3">
                <span className="font-semibold text-[var(--navy)]">作业要求：</span> {submission.briefPreview}
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,247,252,0.92))] px-4 py-3">
                <span className="font-semibold text-[var(--navy)]">记录时间：</span> {formatDate(submission.createdAt)}
              </div>
            </div>
          </article>

          <article className="dark-panel rounded-[38px] p-8 text-white">
            <p className="section-eyebrow text-sm font-semibold text-[var(--gold-soft)]">下一步</p>
            <h3 className="mt-3 text-2xl md:text-3xl">继续衔接 UK Offer 的学术支持服务。</h3>
            <p className="mt-5 text-sm leading-8 text-white/72">
              这份报告适合作为修改规划和后续辅导的起点。你可以先基于报告调整论文，再进入下一轮评估或进一步咨询。
            </p>

            <div className="gold-rule my-7" />

            <div className="flex flex-wrap gap-3">
              <Link href="/#advisory-services" className="luxury-button text-sm">
                了解 UK Offer 服务
              </Link>
              <Link href="/evaluate" className="luxury-button-muted text-sm">
                再评估一篇
              </Link>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
