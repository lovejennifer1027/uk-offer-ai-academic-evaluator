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
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="h-full rounded-[28px] transition hover:-translate-y-0.5">
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
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
            No evaluation summary yet.
          </div>
        )}
      </Card>
    </Link>
  );
}
