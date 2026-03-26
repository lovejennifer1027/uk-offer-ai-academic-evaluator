import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectCreatedBanner } from "@/components/dashboard/project-created-banner";
import { ProjectWorkspaceTabs } from "@/components/dashboard/project-workspace-tabs";
import { Card } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/session";
import { getProjectByIdForUser, listFilesByProject, listMessagesByThread, listReportsByProject, listThreadsByProject } from "@/services/store/local-store";

function getEvaluationBand(score: number) {
  if (score >= 70) {
    return "Distinction range";
  }

  if (score >= 60) {
    return "Merit range";
  }

  if (score >= 50) {
    return "Pass range";
  }

  return "Below pass threshold";
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function ProjectDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ created?: string }>;
}) {
  const user = await requireSessionUser();
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const project = await getProjectByIdForUser(id, user.id);

  if (!project) {
    notFound();
  }

  const files = await listFilesByProject(project.id);
  const reports = await listReportsByProject(project.id);
  const threads = await listThreadsByProject(project.id);
  const messages = threads[0] ? await listMessagesByThread(threads[0].id) : [];
  const latestReport = reports[0] ?? null;

  return (
    <div className="space-y-6">
      {resolvedSearchParams?.created === "1" ? <ProjectCreatedBanner /> : null}

      <Card className="rounded-[30px]">
        {latestReport ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-500">Latest evaluation summary</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{project.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{latestReport.jsonReport.overallSummary}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-right">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Estimated score</div>
                <div className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950">{latestReport.overallScore}</div>
                <div className="mt-2 text-sm text-slate-600">{getEvaluationBand(latestReport.overallScore)}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Overall band</div>
                <div className="mt-2 text-base font-semibold text-slate-950">{getEvaluationBand(latestReport.overallScore)}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Updated</div>
                <div className="mt-2 text-base font-semibold text-slate-950">{formatTimestamp(latestReport.createdAt)}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Project context</div>
                <div className="mt-2 text-base font-semibold text-slate-950">{project.school} · {project.programme}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/dashboard/projects/${project.id}/print`}
                className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(59,78,122,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(59,78,122,0.28)]"
              >
                View full evaluation result
              </Link>
              <Link
                href={`/dashboard/evaluate?project=${project.id}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-slate-300"
              >
                Re-run evaluation
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-500">Latest evaluation summary</div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">No evaluation result yet</h2>
            <p className="text-sm leading-7 text-slate-600">
              This project does not have an evaluation summary yet. Run an evaluation to save the latest score, band, and revision summary into the current project workspace.
            </p>
            <div>
              <Link
                href={`/dashboard/evaluate?project=${project.id}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(59,78,122,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(59,78,122,0.28)]"
              >
                Run first evaluation
              </Link>
            </div>
          </div>
        )}
      </Card>

      <ProjectWorkspaceTabs project={project} files={files} reports={reports} messages={messages} />
    </div>
  );
}
