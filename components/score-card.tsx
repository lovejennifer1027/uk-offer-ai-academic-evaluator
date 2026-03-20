interface ScoreCardProps {
  label: string;
  score: number;
  scale: number;
}

export function ScoreCard({ label, score, scale }: ScoreCardProps) {
  const ratio = Math.max(0, Math.min(100, Math.round((score / scale) * 100)));

  return (
    <article className="card-surface rounded-[30px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--navy)]">
            {score}
            <span className="ml-1 text-base font-medium text-[var(--muted)]">/ {scale}</span>
          </p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-full border border-[rgba(141,139,198,0.16)] bg-[rgba(141,139,198,0.1)] text-xs font-semibold text-[var(--navy)]">
          {ratio}%
        </div>
      </div>
      <div className="mt-5 h-2.5 rounded-full bg-[rgba(21,34,53,0.08)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--navy),#5c75a6,#a2bde5)]"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </article>
  );
}
