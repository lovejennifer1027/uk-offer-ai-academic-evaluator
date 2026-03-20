import { PageShell } from "@/components/page-shell";
import { GeneratedExamplesWorkbench } from "@/components/library/generated-examples-workbench";

export default function LibraryExamplesPage() {
  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
          <div className="reading-column">
            <span className="eyebrow-pill text-sm font-semibold">高分案例生成 / AI-only</span>
            <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">实时生成高分示句、段落模板和表达框架。</h1>
            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              这一页不依赖数据库里的真实样本，而是由 AI 根据你选择的学科、层级、作业类型和目标分数段现场生成学习示例。生成结果会继续保存在当前浏览器里，方便你稍后回看和分析。
            </p>
          </div>

          <aside className="section-panel rounded-[32px] p-6 md:p-7">
            <span className="eyebrow-pill text-sm font-semibold">页面结构</span>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="stat-tile">
                <div className="stat-tile-label">输入区</div>
                <div className="stat-tile-value">先设定学科、层级、作业类型和分数段</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile-label">生成区</div>
                <div className="stat-tile-value">实时返回高分示句、段落模板与表达框架</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile-label">积累区</div>
                <div className="stat-tile-value">保留最近生成结果，方便继续做洞察分析</div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <GeneratedExamplesWorkbench />
        </div>
      </section>
    </PageShell>
  );
}
