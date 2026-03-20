import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { ExampleCard } from "@/components/library/example-card";
import { RubricCard } from "@/components/library/rubric-card";
import { getLibraryDashboardPayload } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

export default async function LibraryHomePage() {
  const dashboard = await getLibraryDashboardPayload();
  const universityMap = new Map(dashboard.universities.map((item) => [item.id, item]));

  return (
    <PageShell>
      <section className="hero-shell pb-18 pt-14 md:pb-24 md:pt-18">
        <div className="page-container">
          <div className="card-surface rounded-[42px] p-8 md:p-12">
            <span className="eyebrow-pill text-sm font-semibold">UK Universities High-Scoring Writing Library</span>
            <h1 className="mt-6 max-w-4xl text-4xl text-[var(--navy)] md:text-6xl">
              面向公开资料建立的英国高校高分写作样本与评分标准 library。
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)]">
              该模块聚合公开来源中的高分写作样本摘要、官方评分标准描述和 marker feedback patterns。页面仅展示公开元数据、摘要、公开摘录与来源链接，不复制或传播受限全文。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/library/examples" className="luxury-button text-sm">浏览写作样本</Link>
              <Link href="/library/rubrics" className="luxury-button-muted text-sm">查看官方评分标准</Link>
              <Link href="/library/insights" className="luxury-button-muted text-sm">生成来源洞察</Link>
            </div>

            <form action="/library/examples" className="mt-8 grid gap-3 rounded-[30px] border border-[var(--line)] bg-white/78 p-4 md:grid-cols-[1fr_auto]">
              <input
                name="query"
                placeholder="搜索 80+ dissertation、Leeds Law rubric、feedback patterns..."
                className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
              <button type="submit" className="luxury-button text-sm">进入样本检索</button>
            </form>
          </div>
        </div>
      </section>

      <section className="page-container py-8 md:py-10">
        <div className="grid gap-4 md:grid-cols-4">
          <article className="card-surface rounded-[30px] p-5">
            <p className="text-sm font-semibold text-[var(--gold)]">最近同步</p>
            <p className="mt-3 text-lg text-[var(--navy)]">
              {dashboard.status.latest_sync_at ? new Date(dashboard.status.latest_sync_at).toLocaleString("zh-CN") : "暂无"}
            </p>
          </article>
          <article className="card-surface rounded-[30px] p-5">
            <p className="text-sm font-semibold text-[var(--gold)]">大学数量</p>
            <p className="mt-3 text-3xl text-[var(--navy)]">{dashboard.status.universities}</p>
          </article>
          <article className="card-surface rounded-[30px] p-5">
            <p className="text-sm font-semibold text-[var(--gold)]">公开样本</p>
            <p className="mt-3 text-3xl text-[var(--navy)]">{dashboard.status.public_examples}</p>
          </article>
          <article className="card-surface rounded-[30px] p-5">
            <p className="text-sm font-semibold text-[var(--gold)]">官方评分标准</p>
            <p className="mt-3 text-3xl text-[var(--navy)]">{dashboard.status.public_rubrics}</p>
          </article>
        </div>
      </section>

      <section className="page-container py-10 md:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow-pill text-sm font-semibold">精选样本</span>
            <h2 className="mt-4 text-3xl text-[var(--navy)]">近期可公开引用的高分写作样本摘要。</h2>
          </div>
          <Link href="/library/examples" className="luxury-button-muted text-sm">查看全部样本</Link>
        </div>
        <div className="grid gap-5">
          {dashboard.featured_examples.map((example) => (
            <ExampleCard key={example.id} example={example} university={universityMap.get(example.university_id) ?? null} />
          ))}
        </div>
      </section>

      <section className="page-container py-10 md:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow-pill text-sm font-semibold">精选评分标准</span>
            <h2 className="mt-4 text-3xl text-[var(--navy)]">公开评分标准 descriptors 的整洁浏览入口。</h2>
          </div>
          <Link href="/library/rubrics" className="luxury-button-muted text-sm">查看全部评分标准</Link>
        </div>
        <div className="grid gap-5">
          {dashboard.featured_rubrics.map((rubric) => (
            <RubricCard key={rubric.id} rubric={rubric} university={universityMap.get(rubric.university_id) ?? null} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
