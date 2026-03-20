import { BriefAnalyzerForm } from "@/components/dashboard/brief-analyzer-form";
import { requireSessionUser } from "@/lib/session";
import { listProjectsByUser } from "@/services/store/local-store";

export default async function AnalyzeBriefPage() {
  const user = await requireSessionUser();
  const projects = await listProjectsByUser(user.id);
  const project = projects[0];

  return <BriefAnalyzerForm language={project?.language ?? "en"} />;
}
