import { CitationHelperWorkspace } from "@/components/dashboard/citation-helper-workspace";
import { resolveCurrentProject } from "@/lib/current-project";
import { requireSessionUser } from "@/lib/session";
import { getProjectByIdForUser, listProjectsByUser } from "@/services/store/local-store";

export default async function CitationsPage({
  searchParams
}: {
  searchParams?: Promise<{ project?: string }>;
}) {
  const user = await requireSessionUser();
  const projects = await listProjectsByUser(user.id);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedProjectId = resolvedSearchParams?.project?.trim();
  const project = requestedProjectId
    ? await getProjectByIdForUser(requestedProjectId, user.id)
    : await resolveCurrentProject(projects);
  return <CitationHelperWorkspace projectId={project?.id} />;
}
