import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CreateProjectForm } from "@/components/dashboard/create-project-form";
import { ProjectCard } from "@/components/dashboard/project-card";
import { requireSessionUser } from "@/lib/session";
import { listProjectsByUser } from "@/services/store/local-store";

export default async function ProjectsPage() {
  const user = await requireSessionUser();
  const projects = await listProjectsByUser(user.id);

  return (
    <div className="space-y-6">
      <CreateProjectForm />

      <Card className="rounded-[30px]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Projects</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Filter-ready project listing with school, module, assignment type, status, and language metadata.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <Input placeholder="School" />
          <Input placeholder="Module" />
          <Select defaultValue="">
            <option value="">Assignment type</option>
            <option value="essay">Essay</option>
            <option value="report">Report</option>
            <option value="dissertation">Dissertation</option>
          </Select>
          <Select defaultValue="">
            <option value="">Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="review">Review</option>
          </Select>
          <Select defaultValue="">
            <option value="">Language</option>
            <option value="en">English</option>
            <option value="zh">Chinese</option>
            <option value="bilingual">Bilingual</option>
          </Select>
        </div>
      </Card>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.length === 0 ? (
          <Card className="rounded-[30px] md:col-span-2 xl:col-span-3">
            <h3 className="text-xl font-semibold text-slate-950">No projects yet</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Create your first project to organize files, run evaluations, chat against your knowledge base, and export revision reports.
            </p>
          </Card>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}
