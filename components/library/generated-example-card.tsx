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
    <article className="card-surface rounded-[36px] p-7 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            <span className="quiet-badge">AI-generated</span>
            <span className="quiet-badge">本地积累</span>
            <span className="quiet-badge">{example.subject}</span>
            <span className="quiet-badge">{LIBRARY_PROGRAMME_LEVEL_LABELS[example.programme_level]}</span>
            <span className="quiet-badge">{LIBRARY_ASSIGNMENT_TYPE_LABELS[example.assignment_type]}</span>
            <span className="quiet-badge">{AI_LIBRARY_SCORE_BAND_LABELS[example.score_band] ?? example.score_band}</span>
          </div>
          <h2 className="mt-5 text-3xl text-[var(--navy)]">{example.title}</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{example.overview}</p>
        </div>

        <div className="rounded-[24px] border border-[var(--line)] bg-white/82 px-4 py-3 text-right text-xs text-[var(--muted)]">
          <p>生成时间</p>
          <p className="mt-2 font-semibold text-[var(--navy)]">{formatDate(example.createdAt)}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-inset rounded-[28px] p-5">
          <h3 className="text-lg text-[var(--navy)]">高分示句</h3>
          <div className="mt-4 space-y-4">
            {example.example_sentences.map((item) => (
              <article key={`${item.purpose}-${item.sentence}`} className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-[var(--navy)]">{item.purpose}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.sentence}</p>
                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{item.why_it_works}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-inset rounded-[28px] p-5">
          <h3 className="text-lg text-[var(--navy)]">{example.paragraph_example.title}</h3>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{example.paragraph_example.paragraph}</p>
          <p className="mt-4 rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--muted)]">
            {example.paragraph_example.why_it_works}
          </p>
        </section>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="surface-inset rounded-[28px] p-5">
          <h3 className="text-lg text-[var(--navy)]">表达模板</h3>
          <div className="mt-4 space-y-4">
            {example.expression_templates.map((item) => (
              <article key={`${item.purpose}-${item.template}`} className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-[var(--navy)]">{item.purpose}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.template}</p>
                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{item.guidance}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="surface-inset rounded-[28px] p-5">
            <h3 className="text-lg text-[var(--navy)]">分析说明</h3>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--muted)]">
              {example.analysis_notes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="surface-inset rounded-[28px] p-5">
            <h3 className="text-lg text-[var(--navy)]">使用提醒</h3>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--muted)]">
              {example.usage_notes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="mt-7 rounded-[28px] border border-[rgba(59,76,107,0.08)] bg-[rgba(255,255,255,0.78)] px-5 py-4 text-sm leading-7 text-[var(--muted)]">
        {example.disclaimer}
      </div>
    </article>
  );
}
