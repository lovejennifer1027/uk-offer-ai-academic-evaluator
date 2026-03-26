import Link from "next/link";

import { Card } from "@/components/ui/card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { resolveCurrentProject } from "@/lib/current-project";
import { getLocale } from "@/lib/i18n";
import { requireSessionUser } from "@/lib/session";
import { listFilesByProject, listProjectsByUser, listReportsByProject } from "@/services/store/local-store";

function getEvaluationBand(score: number) {
  if (score >= 70) {
    return "Distinction";
  }

  if (score >= 60) {
    return "Merit";
  }

  if (score >= 50) {
    return "Pass";
  }

  return "Below pass";
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function DashboardOverviewPage() {
  const locale = await getLocale();
  const user = await requireSessionUser();
  const projects = await listProjectsByUser(user.id);
  const fileCounts = await Promise.all(projects.map((project) => listFilesByProject(project.id).then((files) => files.length)));
  const reportCounts = await Promise.all(projects.map((project) => listReportsByProject(project.id).then((reports) => reports.length)));
  const latestReportsByProject = new Map(
    (
      await Promise.all(
        projects.map(async (project) => {
          const latestReport = (await listReportsByProject(project.id))[0] ?? null;
          return [project.id, latestReport] as const;
        })
      )
    )
  );
  const fileCount = fileCounts.reduce((total, count) => total + count, 0);
  const reportCount = reportCounts.reduce((total, count) => total + count, 0);
  const currentProject = await resolveCurrentProject(projects);
  const currentProjectLatestReport = currentProject ? latestReportsByProject.get(currentProject.id) ?? null : null;

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
                <ProjectCard key={project.id} project={project} latestReport={latestReportsByProject.get(project.id) ?? null} />
              ))
            )}
          </div>
        </Card>

        <Card className="rounded-[30px]">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{locale === "en" ? "Quick actions" : "快捷操作"}</h2>
          {currentProject ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="text-sm font-medium text-slate-500">{locale === "en" ? "Current project" : "当前项目"}</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">{currentProject.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {currentProject.school} · {currentProject.programme} · {currentProject.module}
                </p>
              </div>

              {currentProjectLatestReport ? (
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-500">{locale === "en" ? "Latest evaluation" : "最近评估"}</div>
                    <div className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{currentProjectLatestReport.overallScore}/100</div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-800">
                    {getEvaluationBand(currentProjectLatestReport.overallScore)}
                  </div>
                  <div className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{currentProjectLatestReport.jsonReport.overallSummary}</div>
                  <div className="mt-3 text-xs text-slate-500">
                    {locale === "en" ? "Updated" : "更新于"} {formatTimestamp(currentProjectLatestReport.createdAt)}
                  </div>
                  <div className="mt-4 grid gap-3">
                    <Link
                      href={`/dashboard/projects/${currentProject.id}/print`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-slate-300"
                    >
                      {locale === "en" ? "View full evaluation result" : "查看完整评估结果"}
                    </Link>
                    <Link
                      href={`/dashboard/evaluate?project=${currentProject.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(59,78,122,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(59,78,122,0.28)]"
                    >
                      {locale === "en" ? "Re-run evaluation for current project" : "重新运行当前项目评估"}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
                  <div className="font-medium text-slate-900">{locale === "en" ? "No evaluation yet" : "还没有评估结果"}</div>
                  <p className="mt-2 leading-6">
                    {locale === "en" ? "Run your first evaluation to generate a score summary and revision guidance." : "先运行一次评估，生成分数摘要和修改建议。"}
                  </p>
                  <Link
                    href={`/dashboard/evaluate?project=${currentProject.id}`}
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(59,78,122,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(59,78,122,0.28)]"
                  >
                    {locale === "en" ? "Run evaluation for current project" : "运行当前项目评估"}
                  </Link>
                </div>
              )}

              <div className="grid gap-3">
                <Link
                  href={`/dashboard/upload?project=${currentProject.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-[linear-gradient(135deg,#1f2a44_0%,#3b4e7a_55%,#6b74d6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(59,78,122,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(59,78,122,0.28)]"
                >
                  {locale === "en" ? "Open Upload for current project" : "进入当前项目上传"}
                </Link>
                <Link
                  href={`/dashboard/analyze-brief?project=${currentProject.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-slate-300"
                >
                  {locale === "en" ? "Open Analyze Brief for current project" : "进入当前项目分析要求"}
                </Link>
                <Link
                  href={`/dashboard/evaluate?project=${currentProject.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-slate-300"
                >
                  {locale === "en" ? "Open Evaluate for current project" : "进入当前项目评估"}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div>• {locale === "en" ? "Create a project first to unlock project-aware actions." : "请先创建项目，再使用项目绑定的上传、分析和评估工作流。"}</div>
              <div>• {locale === "en" ? "Upload notes or briefs to your project knowledge base." : "把讲义、brief 或笔记上传到项目知识库。"}</div>
              <div>• {locale === "en" ? "Run a structured paper evaluation." : "执行结构化论文评估。"}</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
