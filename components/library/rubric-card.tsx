import { LIBRARY_PROGRAMME_LEVEL_LABELS } from "@/lib/library/constants";
import type { RubricRecord, UniversityRecord } from "@/lib/library/types";

interface RubricCardProps {
  rubric: RubricRecord;
  university?: UniversityRecord | null;
}

export function RubricCard({ rubric, university }: RubricCardProps) {
  return (
    <article className="card-surface rounded-[34px] p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--gold)]">{university?.short_name ?? university?.name ?? "英国高校"}</p>
          <h3 className="mt-3 text-2xl text-[var(--navy)]">{rubric.rubric_name ?? "未命名评分标准"}</h3>
        </div>
        <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--navy)]">
          {rubric.is_verified ? "已核验" : "待核验"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
        {rubric.department ? <span className="quiet-badge">{rubric.department}</span> : null}
        {rubric.programme_level ? <span className="quiet-badge">{LIBRARY_PROGRAMME_LEVEL_LABELS[rubric.programme_level as keyof typeof LIBRARY_PROGRAMME_LEVEL_LABELS] ?? rubric.programme_level}</span> : null}
      </div>

      {rubric.rubric_text ? (
        <p className="mt-5 text-sm leading-8 text-[var(--muted)]">{rubric.rubric_text}</p>
      ) : null}

      {rubric.score_ranges?.length ? (
        <div className="mt-6 grid gap-3">
          {rubric.score_ranges.slice(0, 4).map((range) => (
            <div key={`${range.label}-${range.descriptor}`} className="surface-inset rounded-[24px] p-4 text-sm leading-7 text-[var(--muted)]">
              <span className="font-semibold text-[var(--navy)]">{range.label}</span>
              {typeof range.minimum === "number" ? ` ${range.minimum}` : ""}
              {typeof range.maximum === "number" ? `-${range.maximum}` : ""}
              ：{range.descriptor}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <a
          href={rubric.source_url}
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
