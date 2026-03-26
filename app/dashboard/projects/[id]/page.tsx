import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { ProjectWorkspaceTabs } from "@/components/dashboard/project-workspace-tabs";
import { requireSessionUser } from "@/lib/session";
import { getProjectByIdForUser, listFilesByProject, listMessagesByThread, listReportsByProject, listThreadsByProject } from "@/services/store/local-store";

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

  return (
    <div className="space-y-6">
      {resolvedSearchParams?.created === "1" ? (
        <Card className="rounded-[30px] border border-emerald-200 bg-emerald-50">
          <h2 className="text-xl font-semibold text-emerald-950">Project created successfully</h2>
          <p className="mt-3 text-sm leading-7 text-emerald-800">
            Your new project is ready. You can now upload files, run evaluations, and continue in this workspace.
          </p>
        </Card>
      ) : null}

      <ProjectWorkspaceTabs project={project} files={files} reports={reports} messages={messages} />
    </div>
  );
}
