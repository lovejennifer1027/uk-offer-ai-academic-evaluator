import { PageShell } from "@/components/page-shell";
import { InsightsQueryPanel } from "@/components/library/insights-query-panel";
import { listUniversities } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

export default async function LibraryInsightsPage() {
  const universities = await listUniversities();

  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        <div className="max-w-4xl">
          <span className="eyebrow-pill text-sm font-semibold">写作样本库 / 来源洞察</span>
          <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">基于来源证据生成写作样本库洞察。</h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            该页面会先检索数据库与 embeddings，再把检索到的证据交给模型做约束式综合，避免脱离来源的泛化结论。
          </p>
        </div>

        <div className="mt-8">
          <InsightsQueryPanel universities={universities} />
        </div>
      </section>
    </PageShell>
  );
}
