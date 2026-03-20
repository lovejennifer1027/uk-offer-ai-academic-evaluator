import { notFound } from "next/navigation";

import { ProjectWorkspaceTabs } from "@/components/dashboard/project-workspace-tabs";
import { requireSessionUser } from "@/lib/session";
import { getProjectByIdForUser, listFilesByProject, listMessagesByThread, listReportsByProject, listThreadsByProject } from "@/services/store/local-store";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  const { id } = await params;
  const project = await getProjectByIdForUser(id, user.id);

  if (!project) {
    notFound();
  }

  const files = await listFilesByProject(project.id);
  const reports = await listReportsByProject(project.id);
  const threads = await listThreadsByProject(project.id);
  const messages = threads[0] ? await listMessagesByThread(threads[0].id) : [];

  return <ProjectWorkspaceTabs project={project} files={files} reports={reports} messages={messages} />;
}
