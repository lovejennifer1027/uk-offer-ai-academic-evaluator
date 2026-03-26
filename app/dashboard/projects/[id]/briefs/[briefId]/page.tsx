import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/session";
import { getProjectByIdForUser, listBriefAnalysesByProject } from "@/services/store/local-store";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function ProjectBriefAnalysisPage({
  params
}: {
  params: Promise<{ id: string; briefId: string }>;
}) {
  const user = await requireSessionUser();
  const { id, briefId } = await params;
  const project = await getProjectByIdForUser(id, user.id);

  if (!project) {
    notFound();
  }

  const briefAnalysis = (await listBriefAnalysesByProject(project.id)).find((analysis) => analysis.id === briefId);

  if (!briefAnalysis) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-500">Saved brief analysis</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{project.title}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {project.school} · {project.programme} · {project.module}
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-right">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Updated</div>
            <div className="mt-2 text-base font-semibold text-slate-950">{formatTimestamp(briefAnalysis.createdAt)}</div>
            <div className="mt-2 text-sm text-slate-600">{briefAnalysis.jsonAnalysis.assignmentType}</div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/analyze-brief?project=${project.id}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(59,78,122,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(59,78,122,0.28)]"
          >
            Re-run brief analysis
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-slate-300"
          >
            Back to project
          </Link>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[30px]">
          <h2 className="text-xl font-semibold text-slate-950">Expected structure</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
            {briefAnalysis.jsonAnalysis.expectedStructure.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-[30px]">
          <h2 className="text-xl font-semibold text-slate-950">Key deliverables</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
            {briefAnalysis.jsonAnalysis.keyDeliverables.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-[30px]">
          <h2 className="text-xl font-semibold text-slate-950">Marking priorities</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
            {briefAnalysis.jsonAnalysis.markingPriorities.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-[30px]">
          <h2 className="text-xl font-semibold text-slate-950">Likely pitfalls</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
            {briefAnalysis.jsonAnalysis.likelyPitfalls.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-[30px]">
          <h2 className="text-xl font-semibold text-slate-950">Recommended outline</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
            {briefAnalysis.jsonAnalysis.recommendedOutline.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-[30px]">
          <h2 className="text-xl font-semibold text-slate-950">Suggested research questions</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
            {briefAnalysis.jsonAnalysis.suggestedResearchQuestions.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
