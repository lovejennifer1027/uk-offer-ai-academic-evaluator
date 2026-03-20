interface ScoreCardProps {
  label: string;
  score: number;
  scale: number;
}

export function ScoreCard({ label, score, scale }: ScoreCardProps) {
  const ratio = Math.max(0, Math.min(100, Math.round((score / scale) * 100)));

  return (
    <article className="card-surface group relative overflow-hidden rounded-[32px] p-6">
      <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(141,139,198,0.4),transparent)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
          <p className="mt-4 text-4xl font-semibold text-[var(--navy)]">
            {score}
            <span className="ml-1 text-base font-medium text-[var(--muted)]">/ {scale}</span>
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">当前维度得分占比 {ratio}%</p>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-full border border-[rgba(141,139,198,0.16)] bg-[rgba(255,255,255,0.72)] text-xs font-semibold text-[var(--navy)] shadow-[0_14px_28px_rgba(67,84,120,0.05)]">
          {ratio}%
        </div>
      </div>
      <div className="relative mt-6 h-2.5 overflow-hidden rounded-full bg-[rgba(21,34,53,0.08)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--navy),#5c75a6,#a2bde5)]"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </article>
  );
}
