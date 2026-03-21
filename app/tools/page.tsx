import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ToolCard } from "@/components/dashboard/tool-card";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function ToolsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const toolCards = [
    {
      title: locale === "en" ? "Paper Evaluation" : "论文评估",
      description: locale === "en" ? "Structured revision feedback with evidence-aware reporting." : "生成结构化修改反馈，并结合检索到的证据给出更可靠的报告。",
      href: "/dashboard/evaluate"
    },
    {
      title: locale === "en" ? "Assignment Brief Analyzer" : "作业要求分析",
      description: locale === "en" ? "Break down task wording, marking priorities, and likely pitfalls." : "拆解题目要求、评分重点和常见误区。",
      href: "/dashboard/analyze-brief"
    },
    {
      title: locale === "en" ? "Citation Helper" : "引用助手",
      description: locale === "en" ? "Format references across APA, MLA, Harvard, and Chicago." : "在 APA、MLA、Harvard 和 Chicago 之间快速整理参考文献。",
      href: "/dashboard/citations"
    },
    {
      title: locale === "en" ? "Literature Summary" : "文献摘要",
      description: locale === "en" ? "Summarize uploaded papers and saved search results." : "为上传文档和检索结果生成更容易阅读的摘要。",
      href: "/dashboard/search"
    },
    {
      title: locale === "en" ? "Knowledge Base Chat" : "知识库问答",
      description: locale === "en" ? "Ask grounded questions over project documents." : "围绕项目文档进行问答，并查看引用片段。",
      href: "/dashboard/knowledge"
    },
    {
      title: locale === "en" ? "Appeal Pack Organizer" : "申诉材料整理",
      description: locale === "en" ? "Organize timelines, supporting evidence, and draft summaries." : "整理时间线、支持材料和供学生复核的摘要草稿。",
      href: "/dashboard/appeal"
    }
  ];

  return (
    <div className="min-h-screen">
      <MarketingHeader locale={locale} nav={dict.nav} loginLabel={dict.ui.login} ctaLabel={dict.ui.startFreeEvaluation} />
      <main className="page-container py-10 md:py-16">
        <section className="story-shell rounded-[38px] px-6 py-8 md:px-8 md:py-10">
          <SectionHeading
            badge={locale === "en" ? "Tool hub" : "工具中心"}
            title={locale === "en" ? "Choose the workflow you need right now." : "按当前任务选择你需要的工作流。"}
            description={locale === "en" ? "Each tool is designed for a focused academic support task." : "每个工具都围绕一个明确的学术支持任务设计。"}
          />
        </section>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {toolCards.map((tool) => (
            <ToolCard key={tool.title} title={tool.title} description={tool.description} status={locale === "en" ? "Available" : "可用"} href={tool.href} />
          ))}
        </div>
      </main>
      <MarketingFooter locale={locale} nav={dict.nav} />
    </div>
  );
}
