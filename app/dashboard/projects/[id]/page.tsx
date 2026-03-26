import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectCreatedBanner } from "@/components/dashboard/project-created-banner";
import { ProjectWorkspaceTabs } from "@/components/dashboard/project-workspace-tabs";
import { Card } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/session";
import {
  getProjectByIdForUser,
  listBriefAnalysesByProject,
  listFilesByProject,
  listMessagesByThread,
  listReportsByProject,
  listThreadsByProject
} from "@/services/store/local-store";

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
  const briefAnalyses = await listBriefAnalysesByProject(project.id);
  const threads = await listThreadsByProject(project.id);
  const messages = threads[0] ? await listMessagesByThread(threads[0].id) : [];
  const latestReport = reports[0] ?? null;
  const latestBriefAnalysis = briefAnalyses[0] ?? null;
  const essayFiles = files.filter((file) => file.category === "essay");
  const briefFiles = files.filter((file) => file.category === "brief");
  const noteFiles = files.filter((file) => file.category === "notes");
  const filePreview = files.slice(0, 3);
  const projectActionLinkClassName =
    "inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(59,78,122,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(59,78,122,0.28)]";
  const secondaryActionLinkClassName =
    "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-slate-300";

  return (
    <div className="space-y-6">
      {resolvedSearchParams?.created === "1" ? <ProjectCreatedBanner /> : null}

      <Card className="rounded-[30px]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-500">Project dashboard</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{project.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                This dashboard keeps the current project’s materials, brief analysis, evaluation result, and next actions in one place so the student can move through the workflow without losing project context.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">{project.school}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">{project.programme}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">{project.module}</span>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Uploaded materials overview</div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Essay / paper</div>
                  <div className="mt-2 text-base font-semibold text-slate-950">{essayFiles.length > 0 ? "Uploaded" : "Not uploaded yet"}</div>
                </div>
                <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Brief / rubric / notes</div>
                  <div className="mt-2 text-base font-semibold text-slate-950">
                    {briefFiles.length + noteFiles.length > 0 ? "Uploaded" : "Not uploaded yet"}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Material count</div>
                <div className="mt-2 text-base font-semibold text-slate-950">{files.length} file{files.length === 1 ? "" : "s"}</div>
                <div className="mt-3 text-sm leading-6 text-slate-600">
                  {filePreview.length > 0 ? filePreview.map((file) => file.filename).join(" · ") : "No project materials uploaded yet."}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Latest brief analysis</div>
              <div className="mt-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4">
                <div className="text-base font-semibold text-slate-950">
                  {latestBriefAnalysis ? "Generated" : "Not generated yet"}
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  {latestBriefAnalysis
                    ? `Assignment type: ${latestBriefAnalysis.jsonAnalysis.assignmentType}. Marking priorities: ${latestBriefAnalysis.jsonAnalysis.markingPriorities.slice(0, 2).join(" · ")}`
                    : "Run Analyze Brief to save structure guidance, key deliverables, and likely pitfalls into this project."}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  {latestBriefAnalysis ? `Updated ${formatTimestamp(latestBriefAnalysis.createdAt)}` : "No saved brief analysis yet."}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Latest evaluation</div>
              <div className="mt-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-950">
                      {latestReport ? `${latestReport.overallScore}/100` : "No evaluation yet"}
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-700">
                      {latestReport ? getEvaluationBand(latestReport.overallScore) : "Run evaluation to generate score and summary."}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {latestReport ? `Updated ${formatTimestamp(latestReport.createdAt)}` : ""}
                  </div>
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-600">
                  {latestReport ? latestReport.jsonReport.overallSummary : "No saved evaluation summary yet."}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Next actions</div>
              <div className="mt-4 grid gap-3">
                <Link href={`/dashboard/upload?project=${project.id}`} className={projectActionLinkClassName}>
                  Upload materials
                </Link>
                <Link href={`/dashboard/analyze-brief?project=${project.id}`} className={secondaryActionLinkClassName}>
                  Analyze brief
                </Link>
                <Link href={`/dashboard/evaluate?project=${project.id}`} className={secondaryActionLinkClassName}>
                  Run evaluation
                </Link>
                {latestReport ? (
                  <Link href={`/dashboard/projects/${project.id}/evaluations/${latestReport.id}`} className={secondaryActionLinkClassName}>
                    View latest evaluation
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[30px]">
          <h2 className="text-xl font-semibold text-slate-950">Brief analysis history</h2>
          <div className="mt-5 space-y-4">
            {briefAnalyses.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-600">
                No saved brief analyses yet.
              </div>
            ) : (
              briefAnalyses.slice(0, 5).map((analysis) => (
                <div key={analysis.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-950">{analysis.jsonAnalysis.assignmentType}</div>
                      <div className="mt-2 text-sm leading-6 text-slate-600">
                        {analysis.jsonAnalysis.markingPriorities.slice(0, 2).join(" · ")}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">{formatTimestamp(analysis.createdAt)}</div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/dashboard/projects/${project.id}/briefs/${analysis.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                      View full brief analysis
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="rounded-[30px]">
          <h2 className="text-xl font-semibold text-slate-950">Evaluation history</h2>
          <div className="mt-5 space-y-4">
            {reports.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-600">
                No saved evaluations yet.
              </div>
            ) : (
              reports.slice(0, 5).map((report) => (
                <div key={report.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-950">
                        {report.overallScore}/100 · {getEvaluationBand(report.overallScore)}
                      </div>
                      <div className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{report.jsonReport.overallSummary}</div>
                    </div>
                    <div className="text-xs text-slate-500">{formatTimestamp(report.createdAt)}</div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/dashboard/projects/${project.id}/evaluations/${report.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                      Open saved evaluation
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

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
                href={`/dashboard/projects/${project.id}/evaluations/${latestReport.id}`}
                className={projectActionLinkClassName}
              >
                View full evaluation result
              </Link>
              <Link
                href={`/dashboard/evaluate?project=${project.id}`}
                className={secondaryActionLinkClassName}
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
                className={projectActionLinkClassName}
              >
                Run first evaluation
              </Link>
            </div>
          </div>
        )}
      </Card>

      <Card className="rounded-[30px]">
        {latestBriefAnalysis ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-500">Latest brief analysis summary</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{latestBriefAnalysis.jsonAnalysis.assignmentType}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  Marking priorities: {latestBriefAnalysis.jsonAnalysis.markingPriorities.slice(0, 3).join(" · ")}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-right">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Updated</div>
                <div className="mt-2 text-base font-semibold text-slate-950">{formatTimestamp(latestBriefAnalysis.createdAt)}</div>
                <div className="mt-2 text-sm text-slate-600">{project.school} · {project.programme}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Structure</div>
                <div className="mt-2 text-sm leading-6 text-slate-950">
                  {latestBriefAnalysis.jsonAnalysis.expectedStructure.slice(0, 3).join(" · ")}
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Key deliverables</div>
                <div className="mt-2 text-sm leading-6 text-slate-950">
                  {latestBriefAnalysis.jsonAnalysis.keyDeliverables.slice(0, 2).join(" · ")}
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Likely pitfalls</div>
                <div className="mt-2 text-sm leading-6 text-slate-950">
                  {latestBriefAnalysis.jsonAnalysis.likelyPitfalls.slice(0, 2).join(" · ")}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/dashboard/projects/${project.id}/briefs/${latestBriefAnalysis.id}`}
                className={projectActionLinkClassName}
              >
                View full brief analysis
              </Link>
              <Link
                href={`/dashboard/analyze-brief?project=${project.id}`}
                className={secondaryActionLinkClassName}
              >
                Re-run brief analysis
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-500">Latest brief analysis summary</div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">No brief analysis result yet</h2>
            <p className="text-sm leading-7 text-slate-600">
              This project does not have a saved brief analysis yet. Run Analyze Brief from this project workspace to save assignment type, structure guidance, and key marking priorities.
            </p>
            <div>
              <Link
                href={`/dashboard/analyze-brief?project=${project.id}`}
                className={projectActionLinkClassName}
              >
                Run first brief analysis
              </Link>
            </div>
          </div>
        )}
      </Card>

      <ProjectWorkspaceTabs project={project} files={files} reports={reports} messages={messages} />
    </div>
  );
}
