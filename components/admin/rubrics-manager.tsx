"use client";

import { useState } from "react";

import { LIBRARY_PROGRAMME_LEVELS, LIBRARY_PROGRAMME_LEVEL_LABELS } from "@/lib/library/constants";
import type { PaginatedResult, RubricRecord, UniversityRecord } from "@/lib/library/types";

interface RubricsManagerProps {
  initialResult: PaginatedResult<RubricRecord>;
  universities: UniversityRecord[];
}

interface DraftState {
  score_ranges: string;
  rubric_json: string;
}

function buildDrafts(items: RubricRecord[]) {
  return Object.fromEntries(
    items.map((item) => [
      item.id,
      {
        score_ranges: JSON.stringify(item.score_ranges ?? [], null, 2),
        rubric_json: JSON.stringify(item.rubric_json ?? {}, null, 2)
      }
    ])
  ) as Record<string, DraftState>;
}

export function RubricsManager({ initialResult, universities }: RubricsManagerProps) {
  const [result, setResult] = useState(initialResult);
  const [jsonDrafts, setJsonDrafts] = useState<Record<string, DraftState>>(() => buildDrafts(initialResult.items));
  const [filters, setFilters] = useState({
    query: "",
    university_id: "",
    department: "",
    programme_level: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateDraft(itemId: string, patch: Partial<DraftState>) {
    setJsonDrafts((current) => ({
      ...current,
      [itemId]: {
        score_ranges: current[itemId]?.score_ranges ?? "[]",
        rubric_json: current[itemId]?.rubric_json ?? "{}",
        ...patch
      }
    }));
  }

  function getDraftScoreRanges(item: RubricRecord) {
    try {
      const parsed = JSON.parse(jsonDrafts[item.id]?.score_ranges ?? "[]") as RubricRecord["score_ranges"];
      return Array.isArray(parsed) ? parsed : item.score_ranges ?? [];
    } catch {
      return item.score_ranges ?? [];
    }
  }

  async function refresh(nextFilters = filters, page = 1) {
    setError(null);
    const url = new URL("/api/admin/rubrics", window.location.origin);
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", "20");

    for (const [key, value] of Object.entries(nextFilters)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url.toString(), { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as PaginatedResult<RubricRecord> & { error?: string };

    if (!response.ok || !Array.isArray(payload.items)) {
      setError(payload?.error ?? "加载评分标准列表失败。");
      return;
    }

    setResult(payload);
    setJsonDrafts(buildDrafts(payload.items));
  }

  async function saveItem(item: RubricRecord) {
    setError(null);
    setMessage(null);

    let rubricJson: unknown = null;
    let scoreRanges: unknown = null;

    try {
      rubricJson = JSON.parse(jsonDrafts[item.id]?.rubric_json ?? "{}");
      scoreRanges = JSON.parse(jsonDrafts[item.id]?.score_ranges ?? "[]");
    } catch {
      setError("rubric_json 或 score_ranges 不是有效 JSON。");
      return;
    }

    const response = await fetch(`/api/admin/rubrics/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        department: item.department,
        programme_level: item.programme_level,
        rubric_name: item.rubric_name,
        rubric_text: item.rubric_text,
        rubric_json: rubricJson,
        score_ranges: scoreRanges,
        source_url: item.source_url
      })
    });
    const payload = (await response.json().catch(() => null)) as { item?: RubricRecord; error?: string } | null;

    if (!response.ok || !payload?.item) {
      setError(payload?.error ?? "保存评分标准失败。");
      return;
    }

    const savedItem = payload.item;
    setResult((current) => ({
      ...current,
      items: current.items.map((candidate) => (candidate.id === savedItem.id ? savedItem : candidate))
    }));
    setJsonDrafts((current) => ({
      ...current,
      [savedItem.id]: {
        score_ranges: JSON.stringify(savedItem.score_ranges ?? [], null, 2),
        rubric_json: JSON.stringify(savedItem.rubric_json ?? {}, null, 2)
      }
    }));
    setMessage(`已保存 ${savedItem.rubric_name ?? "评分标准"}。`);
  }

  async function verifyItem(item: RubricRecord) {
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/admin/rubrics/${item.id}/verify`, {
      method: "POST"
    });
    const payload = (await response.json().catch(() => null)) as { item?: RubricRecord; error?: string } | null;

    if (!response.ok || !payload?.item) {
      setError(payload?.error ?? "核验评分标准失败。");
      return;
    }

    const verifiedItem = payload.item;
    setResult((current) => ({
      ...current,
      items: current.items.map((candidate) => (candidate.id === verifiedItem.id ? verifiedItem : candidate))
    }));
    setMessage(`已核验 ${verifiedItem.rubric_name ?? "评分标准"}。`);
  }

  return (
    <div className="space-y-6">
      <section className="card-surface rounded-[34px] p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <input
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="搜索评分标准名称或文本"
            className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
          <select
            value={filters.university_id}
            onChange={(event) => setFilters((current) => ({ ...current, university_id: event.target.value }))}
            className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          >
            <option value="">全部大学</option>
            {universities.map((university) => (
              <option key={university.id} value={university.id}>
                {university.name}
              </option>
            ))}
          </select>
          <input
            value={filters.department}
            onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))}
            placeholder="院系 / 学科"
            className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
          <select
            value={filters.programme_level}
            onChange={(event) => setFilters((current) => ({ ...current, programme_level: event.target.value }))}
            className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          >
            <option value="">全部层级</option>
            {LIBRARY_PROGRAMME_LEVELS.map((option) => (
              <option key={option} value={option}>
                {LIBRARY_PROGRAMME_LEVEL_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => void refresh()} className="luxury-button text-sm">
            应用筛选
          </button>
        </div>
      </section>

      {message ? (
        <div className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--navy)]">{message}</div>
      ) : null}
      {error ? (
        <div className="rounded-[24px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">
          {error}
        </div>
      ) : null}

      {result.items.length === 0 ? (
        <div className="card-surface rounded-[34px] p-8 text-sm text-[var(--muted)]">当前筛选条件下还没有评分标准记录。</div>
      ) : (
        <div className="space-y-5">
          {result.items.map((item) => (
            <article key={item.id} className="card-surface rounded-[34px] p-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">名称</span>
                  <input
                    value={item.rubric_name ?? ""}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id ? { ...candidate, rubric_name: event.target.value || null } : candidate
                        )
                      }))
                    }
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">院系 / 学科</span>
                  <input
                    value={item.department ?? ""}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id ? { ...candidate, department: event.target.value || null } : candidate
                        )
                      }))
                    }
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">课程层级</span>
                  <select
                    value={item.programme_level ?? ""}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id ? { ...candidate, programme_level: event.target.value || null } : candidate
                        )
                      }))
                    }
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  >
                    <option value="">未填写</option>
                    {LIBRARY_PROGRAMME_LEVELS.map((option) => (
                      <option key={option} value={option}>
                        {LIBRARY_PROGRAMME_LEVEL_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--navy)]">评分标准文本</span>
                <textarea
                  rows={5}
                  value={item.rubric_text ?? ""}
                  onChange={(event) =>
                    setResult((current) => ({
                      ...current,
                      items: current.items.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, rubric_text: event.target.value || null } : candidate
                      )
                    }))
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--navy)]">来源链接</span>
                <input
                  value={item.source_url}
                  onChange={(event) =>
                    setResult((current) => ({
                      ...current,
                      items: current.items.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, source_url: event.target.value } : candidate
                      )
                    }))
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">score_ranges JSON</span>
                  <textarea
                    rows={8}
                    value={jsonDrafts[item.id]?.score_ranges ?? "[]"}
                    onChange={(event) => updateDraft(item.id, { score_ranges: event.target.value })}
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 font-mono text-xs leading-6"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">rubric_json JSON</span>
                  <textarea
                    rows={8}
                    value={jsonDrafts[item.id]?.rubric_json ?? "{}"}
                    onChange={(event) => updateDraft(item.id, { rubric_json: event.target.value })}
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 font-mono text-xs leading-6"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-[24px] border border-[var(--line)] bg-white/86 p-4">
                <p className="text-sm font-semibold text-[var(--navy)]">Score Range 预览</p>
                <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                  {getDraftScoreRanges(item).length === 0 ? (
                    <div>当前还没有可预览的 score ranges。</div>
                  ) : (
                    getDraftScoreRanges(item).map((range) => (
                      <div
                        key={`${range.label}-${range.descriptor}`}
                        className="rounded-[18px] bg-[rgba(141,139,198,0.08)] px-3 py-2"
                      >
                        <span className="font-semibold text-[var(--navy)]">{range.label}</span>
                        {typeof range.minimum === "number" ? ` ${range.minimum}` : ""}
                        {typeof range.maximum === "number" ? `-${range.maximum}` : ""}
                        ：{range.descriptor}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-[var(--muted)]">{item.is_verified ? "当前已核验" : "当前未核验"}</div>
                <div className="flex flex-wrap gap-3">
                  {!item.is_verified ? (
                    <button type="button" onClick={() => void verifyItem(item)} className="luxury-button-muted text-sm">
                      核验
                    </button>
                  ) : null}
                  <button type="button" onClick={() => void saveItem(item)} className="luxury-button text-sm">
                    保存修改
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {result.page_count > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--line)] bg-white/76 px-5 py-4 text-sm text-[var(--muted)]">
          <span>
            第 {result.page} / {result.page_count} 页，共 {result.total} 条评分标准
          </span>
          <div className="flex gap-3">
            {result.page > 1 ? (
              <button type="button" onClick={() => void refresh(filters, result.page - 1)} className="luxury-button-muted text-sm">
                上一页
              </button>
            ) : null}
            {result.page < result.page_count ? (
              <button type="button" onClick={() => void refresh(filters, result.page + 1)} className="luxury-button text-sm">
                下一页
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
