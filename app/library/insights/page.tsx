import { PageShell } from "@/components/page-shell";
import { GeneratedInsightsPanel } from "@/components/library/generated-insights-panel";

export default function LibraryInsightsPage() {
  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        <div className="max-w-4xl">
          <span className="eyebrow-pill text-sm font-semibold">高分案例洞察 / AI-only</span>
          <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">基于你已积累的 AI 高分示例，继续做写作模式分析。</h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            这一页会读取你在高分案例生成页里保存下来的 AI 生成示例，再用模型归纳共性、差异和训练重点。它分析的是你已经积累的 AI 示例，不是假装在调用真实高校原始语料。
          </p>
        </div>

        <div className="mt-8">
          <GeneratedInsightsPanel />
        </div>
      </section>
    </PageShell>
  );
}
