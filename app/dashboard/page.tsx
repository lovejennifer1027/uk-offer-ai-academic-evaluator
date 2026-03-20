import { Card } from "@/components/ui/card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { getLocale } from "@/lib/i18n";
import { requireSessionUser } from "@/lib/session";
import { listFilesByProject, listProjectsByUser, listReportsByProject } from "@/services/store/local-store";

export default async function DashboardOverviewPage() {
  const locale = await getLocale();
  const user = await requireSessionUser();
  const projects = await listProjectsByUser(user.id);
  const fileCounts = await Promise.all(projects.map((project) => listFilesByProject(project.id).then((files) => files.length)));
  const reportCounts = await Promise.all(projects.map((project) => listReportsByProject(project.id).then((reports) => reports.length)));
  const fileCount = fileCounts.reduce((total, count) => total + count, 0);
  const reportCount = reportCounts.reduce((total, count) => total + count, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        {[
          { label: locale === "en" ? "Projects" : "项目数", value: String(projects.length) },
          { label: locale === "en" ? "Reports" : "报告数", value: String(reportCount) },
          { label: locale === "en" ? "Uploaded files" : "上传文件", value: String(fileCount) },
          { label: locale === "en" ? "Plan" : "计划", value: user.plan.toUpperCase() }
        ].map((item) => (
          <Card key={item.label} className="rounded-[28px]">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{item.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[30px]">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{locale === "en" ? "Recent projects" : "最近项目"}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {projects.length === 0 ? (
              <Card className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 shadow-none">
                <div className="text-sm font-semibold text-slate-900">
                  {locale === "en" ? "No projects yet" : "还没有项目"}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {locale === "en"
                    ? "Create your first project to keep files, evaluations, briefs, and chat threads in one place."
                    : "创建第一个项目后，你就可以把文件、评估、要求分析和聊天记录放在同一个工作台里。"}
                </p>
              </Card>
            ) : (
              projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </Card>

        <Card className="rounded-[30px]">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{locale === "en" ? "Quick actions" : "快捷操作"}</h2>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div>• {locale === "en" ? "Upload notes or briefs to your project knowledge base." : "把讲义、brief 或笔记上传到项目知识库。"}</div>
            <div>• {locale === "en" ? "Run a structured paper evaluation." : "执行结构化论文评估。"}</div>
            <div>• {locale === "en" ? "Format references and compare evidence in one place." : "在同一处整理引用并对照证据。"}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
