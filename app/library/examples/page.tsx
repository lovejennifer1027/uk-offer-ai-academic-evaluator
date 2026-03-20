import { PageShell } from "@/components/page-shell";
import { GeneratedExamplesWorkbench } from "@/components/library/generated-examples-workbench";

export default function LibraryExamplesPage() {
  return (
    <PageShell>
      <section className="hero-shell relative overflow-hidden py-14 md:py-18">
        <div className="page-container">
          <div className="hero-stage px-7 py-8 md:px-10 md:py-10 xl:px-12 xl:py-12">
            <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
              <div className="reading-column">
                <span className="eyebrow-pill text-sm font-semibold">高分案例生成 / AI-only</span>
                <h1 className="mt-7 text-4xl leading-[0.96] text-[var(--navy)] md:text-5xl xl:text-6xl">
                  实时生成高分示句、
                  <br className="hidden xl:block" />
                  段落模板和表达框架。
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)]">
                  这一页不依赖数据库里的真实样本，而是由 AI 根据你选择的学科、层级、作业类型和目标分数段现场生成学习示例。生成结果会继续保存在当前浏览器里，方便你稍后回看和分析。
                </p>

                <div className="mt-8 flex flex-wrap gap-3 text-sm">
                  <span className="quiet-badge">AI-generated examples</span>
                  <span className="quiet-badge">实时生成</span>
                  <span className="quiet-badge">浏览器内自动积累</span>
                </div>
              </div>

              <aside className="modern-showcase p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">页面结构</p>
                    <h2 className="mt-4 text-2xl text-[var(--navy)] md:text-3xl">先设条件，再生成，再继续积累分析。</h2>
                  </div>
                  <span className="signal-status">
                    <span className="signal-dot is-live" />
                    Ready to generate
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="mini-floating-card p-4">
                    <div className="stat-tile-label">输入区</div>
                    <div className="mt-2 text-base font-semibold text-[var(--navy)]">先设定学科、层级、作业类型和分数段</div>
                  </div>
                  <div className="mini-floating-card p-4">
                    <div className="stat-tile-label">生成区</div>
                    <div className="mt-2 text-base font-semibold text-[var(--navy)]">实时返回高分示句、段落模板与表达框架</div>
                  </div>
                  <div className="mini-floating-card p-4">
                    <div className="stat-tile-label">积累区</div>
                    <div className="mt-2 text-base font-semibold text-[var(--navy)]">保留最近生成结果，方便继续做洞察分析</div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container pb-18 md:pb-24">
        <GeneratedExamplesWorkbench />
      </section>
    </PageShell>
  );
}
