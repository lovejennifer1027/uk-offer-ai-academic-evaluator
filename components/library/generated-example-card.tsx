"use client";

import { AI_LIBRARY_SCORE_BAND_LABELS } from "@/lib/ai-library/constants";
import type { GeneratedExamplePack } from "@/lib/ai-library/types";
import {
  LIBRARY_ASSIGNMENT_TYPE_LABELS,
  LIBRARY_PROGRAMME_LEVEL_LABELS
} from "@/lib/library/constants";
import { formatDate } from "@/lib/utils";

interface GeneratedExampleCardProps {
  example: GeneratedExamplePack;
}

export function GeneratedExampleCard({ example }: GeneratedExampleCardProps) {
  return (
    <article className="space-y-6">
      <section className="hero-stage px-7 py-8 md:px-10 md:py-10">
        <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
              <span className="quiet-badge">AI-generated</span>
              <span className="quiet-badge">本地积累</span>
              <span className="quiet-badge">{example.subject}</span>
              <span className="quiet-badge">{LIBRARY_PROGRAMME_LEVEL_LABELS[example.programme_level]}</span>
              <span className="quiet-badge">{LIBRARY_ASSIGNMENT_TYPE_LABELS[example.assignment_type]}</span>
              <span className="quiet-badge">{AI_LIBRARY_SCORE_BAND_LABELS[example.score_band] ?? example.score_band}</span>
            </div>
            <h2 className="mt-7 text-4xl leading-[0.98] text-[var(--navy)] md:text-5xl">{example.title}</h2>
            <p className="mt-6 text-base leading-8 text-[var(--muted)]">{example.overview}</p>
          </div>

          <div className="modern-showcase relative z-10 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">结果概览</p>
                <h3 className="mt-4 text-2xl text-[var(--navy)]">先理解使用场景，再看具体示句和模板。</h3>
              </div>
              <span className="signal-status">
                <span className="signal-dot is-live" />
                AI output
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="mini-floating-card p-4">
                <div className="stat-tile-label">生成时间</div>
                <div className="mt-2 text-base font-semibold text-[var(--navy)]">{formatDate(example.createdAt)}</div>
              </div>
              <div className="mini-floating-card p-4">
                <div className="stat-tile-label">输出来源</div>
                <div className="mt-2 text-base font-semibold text-[var(--navy)]">
                  {example.source === "openai" ? "OpenAI 实时生成" : "Demo 生成模式"}
                </div>
              </div>
              <div className="mini-floating-card p-4 sm:col-span-2">
                <div className="stat-tile-label">当前聚焦</div>
                <div className="mt-2 text-base font-semibold text-[var(--navy)]">
                  {example.focus?.trim() ? example.focus : "未指定额外聚焦点"}
                </div>
              </div>
            </div>

            <div className="section-panel mt-6 rounded-[24px] px-4 py-4">
              <h4 className="text-sm font-semibold text-[var(--navy)]">推荐阅读顺序</h4>
              <ul className="editorial-list mt-4 space-y-2 text-sm leading-7 text-[var(--muted)]">
                <li>先读高分示句，理解每个句子的写作动作，而不是直接照搬。</li>
                <li>再看段落示例，感受一整段内部怎样承接、分析和收束。</li>
                <li>最后结合表达模板和使用提醒，把内容改写成你自己的学科语境。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <article className="card-surface rounded-[34px] p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">高分示句</p>
              <h3 className="mt-4 text-2xl text-[var(--navy)]">先拆句子层面的高分动作。</h3>
            </div>
            <span className="rounded-full border border-[rgba(59,76,107,0.08)] bg-white/76 px-3 py-1 text-xs text-[var(--muted)]">
              Sentence-level examples
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {example.example_sentences.map((item) => (
              <article key={`${item.purpose}-${item.sentence}`} className="mini-floating-card p-5">
                <p className="text-sm font-semibold text-[var(--navy)]">{item.purpose}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.sentence}</p>
                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{item.why_it_works}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="modern-showcase rounded-[34px] p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">段落示例</p>
              <h3 className="mt-4 text-2xl text-[var(--navy)]">{example.paragraph_example.title}</h3>
            </div>
            <span className="signal-status">
              <span className="signal-dot is-live" />
              Paragraph sample
            </span>
          </div>
          <div className="mini-floating-card mt-6 p-5">
            <p className="text-sm leading-8 text-[var(--muted)]">{example.paragraph_example.paragraph}</p>
          </div>
          <div className="section-panel mt-5 rounded-[24px] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
            {example.paragraph_example.why_it_works}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <article className="card-surface rounded-[34px] p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">表达模板</p>
              <h3 className="mt-4 text-2xl text-[var(--navy)]">把结构保留，把表达改成你自己的语境。</h3>
            </div>
            <span className="rounded-full border border-[rgba(59,76,107,0.08)] bg-white/76 px-3 py-1 text-xs text-[var(--muted)]">
              Reusable frames
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {example.expression_templates.map((item) => (
              <article key={`${item.purpose}-${item.template}`} className="mini-floating-card p-5">
                <p className="text-sm font-semibold text-[var(--navy)]">{item.purpose}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.template}</p>
                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{item.guidance}</p>
              </article>
            ))}
          </div>
        </article>

        <div className="space-y-5">
          <section className="card-surface rounded-[34px] p-6 md:p-7">
            <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">分析说明</p>
            <h3 className="mt-4 text-2xl text-[var(--navy)]">为什么这组结果更像目标分数段。</h3>
            <ul className="editorial-list mt-5 space-y-2 text-sm leading-7 text-[var(--muted)]">
              {example.analysis_notes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="card-surface rounded-[34px] p-6 md:p-7">
            <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">使用提醒</p>
            <h3 className="mt-4 text-2xl text-[var(--navy)]">用来学习结构，不要直接照搬。</h3>
            <ul className="editorial-list mt-5 space-y-2 text-sm leading-7 text-[var(--muted)]">
              {example.usage_notes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <div className="rounded-[30px] border border-[rgba(59,76,107,0.08)] bg-[rgba(255,255,255,0.72)] px-5 py-4 text-sm leading-7 text-[var(--muted)] shadow-[0_16px_34px_rgba(67,84,120,0.05)]">
        {example.disclaimer}
      </div>
    </article>
  );
}
