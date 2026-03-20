import { PageShell } from "@/components/page-shell";
import { RubricCard } from "@/components/library/rubric-card";
import { LIBRARY_PROGRAMME_LEVELS, LIBRARY_PROGRAMME_LEVEL_LABELS } from "@/lib/library/constants";
import { listRubrics, listUniversities } from "@/lib/library/repository";

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
  return `/library/rubrics?${search.toString()}`;
}

export default async function LibraryRubricsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(Number(getParam(params.page) ?? "1") || 1, 1);
  const [result, universities] = await Promise.all([
    listRubrics({
      page,
      page_size: 12,
      query: getParam(params.query) ?? undefined,
      university_id: getParam(params.university_id) ?? undefined,
      department: getParam(params.department) ?? undefined,
      programme_level: getParam(params.programme_level) ?? undefined
    }),
    listUniversities()
  ]);
  const universityMap = new Map(universities.map((item) => [item.id, item]));

  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        <div className="max-w-4xl">
          <span className="eyebrow-pill text-sm font-semibold">写作样本库 / 评分标准</span>
          <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">英国高校公开评分标准 descriptors。</h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            页面优先整理官方公开评分标准、score ranges 和 descriptor 结构，适合作为学术评估与辅导前的对照参考。
          </p>
        </div>

        <form className="card-surface mt-8 rounded-[34px] p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-4">
            <input name="query" defaultValue={getParam(params.query) ?? ""} placeholder="搜索评分标准" className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm" />
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
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="luxury-button text-sm">应用筛选</button>
          </div>
        </form>

        <div className="mt-8 space-y-5">
          {result.items.length === 0 ? (
            <div className="card-surface rounded-[34px] p-8 text-sm text-[var(--muted)]">当前筛选条件下还没有匹配的评分标准。</div>
          ) : (
            result.items.map((rubric) => (
              <RubricCard key={rubric.id} rubric={rubric} university={universityMap.get(rubric.university_id) ?? null} />
            ))
          )}
        </div>

        {result.total > result.page_size ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--line)] bg-white/76 px-5 py-4 text-sm text-[var(--muted)]">
            <span>
              第 {result.page} / {result.page_count} 页，共 {result.total} 条评分标准
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
