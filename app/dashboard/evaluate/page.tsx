import { EvaluationWorkspace } from "@/components/dashboard/evaluation-workspace";
import { Card } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/session";
import { listProjectsByUser } from "@/services/store/local-store";

export default async function DashboardEvaluatePage() {
  const user = await requireSessionUser();
  const projects = await listProjectsByUser(user.id);
  const project = projects[0];

  if (!project) {
    return (
      <Card className="rounded-[30px]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Create your first project</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Paper evaluation is project-aware. Create a project first so reports, uploads, and retrieved evidence stay tied to the same workspace.
        </p>
      </Card>
    );
  }

  return (
    <EvaluationWorkspace
      projectId={project.id}
      language={project.language}
      initialSchool={project.school}
      projectTitle={project.title}
      moduleCode={project.module}
    />
  );
}
