import { PageShell } from "@/components/page-shell";
import { ExampleCard } from "@/components/library/example-card";
import {
  LIBRARY_ASSIGNMENT_TYPES,
  LIBRARY_ASSIGNMENT_TYPE_LABELS,
  LIBRARY_PROGRAMME_LEVELS,
  LIBRARY_PROGRAMME_LEVEL_LABELS
} from "@/lib/library/constants";
import { listExamples, listUniversities } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildPageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const search = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(params)) {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (!value || key === "page") {
      continue;
    }

    search.set(key, value);
  }

  search.set("page", String(page));
  return `/library/examples?${search.toString()}`;
}

export default async function LibraryExamplesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(getParam(params.page) ?? "1");
  const pageSize = Number(getParam(params.page_size) ?? "12");
  const safePage = Number.isFinite(page) ? Math.max(page, 1) : 1;
  const safePageSize = Number.isFinite(pageSize) ? Math.max(pageSize, 1) : 12;
  const [result, universities] = await Promise.all([
    listExamples({
      page: safePage,
      page_size: safePageSize,
      query: getParam(params.query) ?? undefined,
      university_id: getParam(params.university_id) ?? undefined,
      department: getParam(params.department) ?? undefined,
      programme_level: (getParam(params.programme_level) as "undergraduate" | "masters" | "phd" | "unknown" | undefined) ?? undefined,
      assignment_type: (getParam(params.assignment_type) as "essay" | "dissertation" | "report" | "reflection" | "proposal" | "unknown" | undefined) ?? undefined,
      score_band: getParam(params.score_band) ?? undefined,
      access_level: "public"
    }),
    listUniversities()
  ]);
  const universityMap = new Map(universities.map((item) => [item.id, item]));

  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        <div className="max-w-4xl">
          <span className="eyebrow-pill text-sm font-semibold">写作样本库 / 高分样本</span>
          <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">公开高分写作样本摘要库。</h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            仅展示公开可引用的样本元数据、简短摘录、优势预览和来源链接，不转载受限全文。
          </p>
        </div>

        <form className="card-surface mt-8 rounded-[34px] p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <input name="query" defaultValue={getParam(params.query) ?? ""} placeholder="搜索样本内容" className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm" />
            <select name="university_id" defaultValue={getParam(params.university_id) ?? ""} className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm">
              <option value="">全部大学</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>{university.name}</option>
              ))}
            </select>
            <input name="department" defaultValue={getParam(params.department) ?? ""} placeholder="院系 / 学科" className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm" />
            <select name="programme_level" defaultValue={getParam(params.programme_level) ?? ""} className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm">
              <option value="">全部层级</option>
              {LIBRARY_PROGRAMME_LEVELS.map((option) => (
                <option key={option} value={option}>{LIBRARY_PROGRAMME_LEVEL_LABELS[option]}</option>
              ))}
            </select>
            <select name="assignment_type" defaultValue={getParam(params.assignment_type) ?? ""} className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm">
              <option value="">全部作业类型</option>
              {LIBRARY_ASSIGNMENT_TYPES.map((option) => (
                <option key={option} value={option}>{LIBRARY_ASSIGNMENT_TYPE_LABELS[option]}</option>
              ))}
            </select>
            <input name="score_band" defaultValue={getParam(params.score_band) ?? ""} placeholder="分数段" className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm" />
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="luxury-button text-sm">应用筛选</button>
          </div>
        </form>

        <div className="mt-8 space-y-5">
          {result.items.length === 0 ? (
            <div className="card-surface rounded-[34px] p-8 text-sm text-[var(--muted)]">当前筛选条件下还没有公开样本。</div>
          ) : (
            result.items.map((example) => (
              <ExampleCard key={example.id} example={example} university={universityMap.get(example.university_id) ?? null} />
            ))
          )}
        </div>

        {result.total > result.page_size ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--line)] bg-white/76 px-5 py-4 text-sm text-[var(--muted)]">
            <span>
              第 {result.page} / {result.page_count} 页，共 {result.total} 条公开样本
            </span>
            <div className="flex gap-3">
              {result.page > 1 ? (
                <a href={buildPageHref(params, result.page - 1)} className="luxury-button-muted text-sm">
                  上一页
                </a>
              ) : null}
              {result.page < result.page_count ? (
                <a href={buildPageHref(params, result.page + 1)} className="luxury-button text-sm">
                  下一页
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
