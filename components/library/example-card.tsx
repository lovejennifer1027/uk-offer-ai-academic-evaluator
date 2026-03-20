import {
  LIBRARY_ACCESS_LEVEL_LABELS,
  LIBRARY_ASSIGNMENT_TYPE_LABELS,
  LIBRARY_PROGRAMME_LEVEL_LABELS
} from "@/lib/library/constants";
import type { HighScoringExampleRecord, UniversityRecord } from "@/lib/library/types";

interface ExampleCardProps {
  example: HighScoringExampleRecord;
  university?: UniversityRecord | null;
}

export function ExampleCard({ example, university }: ExampleCardProps) {
  return (
    <article className="card-surface rounded-[34px] p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--gold)]">{university?.short_name ?? university?.name ?? "英国高校"}</p>
          <h3 className="mt-3 text-2xl text-[var(--navy)]">{example.title ?? "未命名公开样本"}</h3>
        </div>
        <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--navy)]">
          {LIBRARY_ACCESS_LEVEL_LABELS[example.access_level]}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
        <span className="quiet-badge">{LIBRARY_PROGRAMME_LEVEL_LABELS[example.programme_level]}</span>
        <span className="quiet-badge">{LIBRARY_ASSIGNMENT_TYPE_LABELS[example.assignment_type]}</span>
        {example.score_band ? <span className="quiet-badge">{example.score_band}</span> : null}
        {typeof example.exact_score === "number" ? <span className="quiet-badge">{example.exact_score} 分</span> : null}
      </div>

      {example.public_excerpt ? (
        <p className="mt-5 text-sm leading-8 text-[var(--muted)]">{example.public_excerpt}</p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="surface-inset rounded-[26px] p-4">
          <p className="text-sm font-semibold text-[var(--navy)]">优势预览</p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
            {example.strengths.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="surface-inset rounded-[26px] p-4">
          <p className="text-sm font-semibold text-[var(--navy)]">评语摘要</p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
            {example.marker_comments_summary.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">来源链接保留，页面仅展示公开摘要与可公开引用信息。</p>
        <a
          href={example.source_url}
          target="_blank"
          rel="noreferrer"
          className="luxury-button-muted text-sm"
        >
          查看原始来源
        </a>
      </div>
    </article>
  );
}
