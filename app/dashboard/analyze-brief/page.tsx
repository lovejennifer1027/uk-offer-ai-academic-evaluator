import Link from "next/link";

import AnalyzeBriefWorkspace from "@/components/dashboard/AnalyzeBriefWorkspace";
import { Card } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/session";
import { getProjectByIdForUser } from "@/services/store/local-store";

export default async function AnalyzeBriefPage({
  searchParams
}: {
  searchParams?: Promise<{ project?: string }>;
}) {
  const user = await requireSessionUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedProjectId = resolvedSearchParams?.project?.trim();
  const project = requestedProjectId ? await getProjectByIdForUser(requestedProjectId, user.id) : null;

  if (!requestedProjectId) {
    return (
      <Card className="rounded-[30px]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Select a project first</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Open Analyze Brief from a project detail page so ScholarDesk can use the correct project title, school, and programme as the current context.
        </p>
        <div className="mt-5">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(59,78,122,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(59,78,122,0.28)]"
          >
            Go to projects
          </Link>
        </div>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className="rounded-[30px]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Project not found</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          The project link is invalid or this project is no longer available in your workspace. Please return to Projects and open Analyze Brief from the correct project.
        </p>
        <div className="mt-5">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(59,78,122,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(59,78,122,0.28)]"
          >
            Back to projects
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-500">Current project</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{project.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Analyze Brief is currently using this project as the active context. School-facing examples should align with the same workspace before the student moves into evaluation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">{project.school}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">{project.programme}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">{project.module}</span>
          </div>
        </div>
      </Card>

      <AnalyzeBriefWorkspace initialSchool={project.school} />
    </div>
  );
}
