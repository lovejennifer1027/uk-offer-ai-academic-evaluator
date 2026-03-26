import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { EvaluationReportRecord, ProjectRecord } from "@/types/scholardesk";

function getEvaluationBand(score: number) {
  if (score >= 70) {
    return "Distinction";
  }

  if (score >= 60) {
    return "Merit";
  }

  if (score >= 50) {
    return "Pass";
  }

  return "Below pass";
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function ProjectCard({
  project,
  latestReport
}: {
  project: ProjectRecord;
  latestReport?: EvaluationReportRecord | null;
}) {
  return (
    <Card className="relative h-full rounded-[28px] transition hover:-translate-y-0.5">
      <Link
        href={`/dashboard/projects/${project.id}`}
        aria-label={`Open project ${project.title}`}
        className="absolute inset-0 rounded-[28px]"
      />
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-950">{project.title}</h3>
          <Badge>{project.status}</Badge>
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div>{project.school}</div>
          <div>
            {project.programme} · {project.module} · {project.assignmentType} · {project.language}
          </div>
        </div>

        {latestReport ? (
          <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Latest evaluation</div>
              <div className="text-lg font-semibold text-slate-950">{latestReport.overallScore}/100</div>
            </div>
            <div className="mt-2 text-sm font-medium text-slate-800">{getEvaluationBand(latestReport.overallScore)}</div>
            <div className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{latestReport.jsonReport.overallSummary}</div>
            <div className="mt-3 text-xs text-slate-500">Updated {formatTimestamp(latestReport.createdAt)}</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/dashboard/projects/${project.id}/print`}
                className="relative z-20 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                View full result
              </Link>
              <Link
                href={`/dashboard/evaluate?project=${project.id}`}
                className="relative z-20 inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(59,78,122,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(59,78,122,0.28)]"
              >
                Re-run evaluation
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
            <div>No evaluation summary yet.</div>
            <div className="mt-4">
              <Link
                href={`/dashboard/evaluate?project=${project.id}`}
                className="relative z-20 inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(59,78,122,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(59,78,122,0.28)]"
              >
                Run first evaluation
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
