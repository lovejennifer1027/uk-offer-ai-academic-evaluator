import { PageShell } from "@/components/page-shell";
import { GeneratedInsightsPanel } from "@/components/library/generated-insights-panel";

export default function LibraryInsightsPage() {
  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
          <div className="reading-column">
            <span className="eyebrow-pill text-sm font-semibold">高分案例洞察 / AI-only</span>
            <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">基于你已积累的 AI 高分示例，继续做写作模式分析。</h1>
            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              这一页会读取你在高分案例生成页里保存下来的 AI 生成示例，再用模型归纳共性、差异和训练重点。它分析的是你已经积累的 AI 示例，不是假装在调用真实高校原始语料。
            </p>
          </div>

          <aside className="section-panel rounded-[32px] p-6 md:p-7">
            <span className="eyebrow-pill text-sm font-semibold">分析方式</span>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="stat-tile">
                <div className="stat-tile-label">先筛选</div>
                <div className="stat-tile-value">按学科、层级、类型和分数段缩小分析范围</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile-label">再提问</div>
                <div className="stat-tile-value">把你真正想问的结构、表达或论证问题交给 AI</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile-label">最后复盘</div>
                <div className="stat-tile-value">用引用到的示例片段检查回答是否贴近已积累样本</div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <GeneratedInsightsPanel />
        </div>
      </section>
    </PageShell>
  );
}
