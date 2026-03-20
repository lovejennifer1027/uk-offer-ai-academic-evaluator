import { PageShell } from "@/components/page-shell";
import { GeneratedExamplesWorkbench } from "@/components/library/generated-examples-workbench";

export default function LibraryExamplesPage() {
  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        <div className="max-w-4xl">
          <span className="eyebrow-pill text-sm font-semibold">高分案例生成 / AI-only</span>
          <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">实时生成高分示句、段落模板和表达框架。</h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            这一页不依赖数据库里的真实样本，而是由 AI 根据你选择的学科、层级、作业类型和目标分数段现场生成学习示例。生成结果会继续保存在当前浏览器里，方便你稍后回看和分析。
          </p>
        </div>

        <div className="mt-8">
          <GeneratedExamplesWorkbench />
        </div>
      </section>
    </PageShell>
  );
}
