import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/session";
import { getProjectByIdForUser, listReportsByProject } from "@/services/store/local-store";

export default async function ProjectPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  const { id } = await params;
  const project = await getProjectByIdForUser(id, user.id);

  if (!project) {
    notFound();
  }

  const latestReport = (await listReportsByProject(project.id))[0];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 print:px-0">
      <Card className="rounded-[30px] p-10 shadow-none print:border-none print:shadow-none">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">{project.title}</h1>
        <p className="mt-4 text-sm text-slate-500">
          {project.school} · {project.module} · {project.assignmentType}
        </p>

        {latestReport ? (
          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">Overall summary</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">{latestReport.jsonReport.overallSummary}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">Revision checklist</h2>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                {latestReport.jsonReport.revisionChecklist.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <p className="mt-8 text-sm text-slate-600">No evaluation report has been generated for this project yet.</p>
        )}
      </Card>
    </main>
  );
}
