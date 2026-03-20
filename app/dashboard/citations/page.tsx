import { CitationHelperWorkspace } from "@/components/dashboard/citation-helper-workspace";
import { requireSessionUser } from "@/lib/session";
import { listProjectsByUser } from "@/services/store/local-store";

export default async function CitationsPage() {
  const user = await requireSessionUser();
  const projects = await listProjectsByUser(user.id);
  return <CitationHelperWorkspace projectId={projects[0]?.id} />;
}
