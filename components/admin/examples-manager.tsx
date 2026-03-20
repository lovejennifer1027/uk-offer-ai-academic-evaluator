"use client";

import { useState } from "react";

import {
  LIBRARY_ACCESS_LEVEL_LABELS,
  LIBRARY_ACCESS_LEVELS,
  LIBRARY_ASSIGNMENT_TYPES,
  LIBRARY_ASSIGNMENT_TYPE_LABELS,
  LIBRARY_PROGRAMME_LEVELS,
  LIBRARY_PROGRAMME_LEVEL_LABELS
} from "@/lib/library/constants";
import type { HighScoringExampleRecord, PaginatedResult, UniversityRecord } from "@/lib/library/types";

interface ExamplesManagerProps {
  initialResult: PaginatedResult<HighScoringExampleRecord>;
  universities: UniversityRecord[];
}

function toLines(values: string[]) {
  return values.join("\n");
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ExamplesManager({ initialResult, universities }: ExamplesManagerProps) {
  const [result, setResult] = useState(initialResult);
  const [filters, setFilters] = useState({
    query: "",
    university_id: "",
    department: "",
    score_band: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh(nextFilters = filters, page = 1) {
    setError(null);
    const url = new URL("/api/admin/examples", window.location.origin);
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", "20");

    for (const [key, value] of Object.entries(nextFilters)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url.toString(), { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as PaginatedResult<HighScoringExampleRecord> & {
      error?: string;
    };

    if (!response.ok || !Array.isArray(payload.items)) {
      setError(payload?.error ?? "加载示例列表失败。");
      return;
    }

    setResult(payload);
  }

  async function saveItem(item: HighScoringExampleRecord) {
    setError(null);
    const response = await fetch(`/api/admin/examples/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(item)
    });
    const payload = (await response.json().catch(() => null)) as { item?: HighScoringExampleRecord; error?: string } | null;

    if (!response.ok || !payload?.item) {
      setError(payload?.error ?? "保存示例失败。");
      return;
    }

    setResult((current) => ({
      ...current,
      items: current.items.map((candidate) => (candidate.id === payload.item!.id ? payload.item! : candidate))
    }));
    setMessage(`已保存 ${payload.item.title ?? "示例"}。`);
  }

  async function verifyItem(item: HighScoringExampleRecord) {
    const response = await fetch(`/api/admin/examples/${item.id}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        verified_by: "admin-ui"
      })
    });
    const payload = (await response.json().catch(() => null)) as { item?: HighScoringExampleRecord; error?: string } | null;

    if (!response.ok || !payload?.item) {
      setError(payload?.error ?? "核验示例失败。");
      return;
    }

    setResult((current) => ({
      ...current,
      items: current.items.map((candidate) => (candidate.id === payload.item!.id ? payload.item! : candidate))
    }));
    setMessage(`已核验 ${payload.item.title ?? "示例"}。`);
  }

  return (
    <div className="space-y-6">
      <section className="card-surface rounded-[34px] p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <input
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="搜索标题、摘要、优势"
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
          <input
            value={filters.score_band}
            onChange={(event) => setFilters((current) => ({ ...current, score_band: event.target.value }))}
            placeholder="分数段"
            className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
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
        <div className="card-surface rounded-[34px] p-8 text-sm text-[var(--muted)]">当前筛选条件下还没有样本记录。</div>
      ) : (
        <div className="space-y-5">
          {result.items.map((item) => (
            <article key={item.id} className="card-surface rounded-[34px] p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">标题</span>
                  <input
                    value={item.title ?? ""}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id ? { ...candidate, title: event.target.value || null } : candidate
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
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">课程层级</span>
                  <select
                    value={item.programme_level}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id
                            ? { ...candidate, programme_level: event.target.value as HighScoringExampleRecord["programme_level"] }
                            : candidate
                        )
                      }))
                    }
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  >
                    {LIBRARY_PROGRAMME_LEVELS.map((option) => (
                      <option key={option} value={option}>
                        {LIBRARY_PROGRAMME_LEVEL_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">作业类型</span>
                  <select
                    value={item.assignment_type}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id
                            ? { ...candidate, assignment_type: event.target.value as HighScoringExampleRecord["assignment_type"] }
                            : candidate
                        )
                      }))
                    }
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  >
                    {LIBRARY_ASSIGNMENT_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {LIBRARY_ASSIGNMENT_TYPE_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">分数 / 分数段</span>
                  <div className="mt-3 grid grid-cols-[120px_1fr] gap-3">
                    <input
                      value={item.exact_score ?? ""}
                      onChange={(event) =>
                        setResult((current) => ({
                          ...current,
                          items: current.items.map((candidate) =>
                            candidate.id === item.id
                              ? {
                                  ...candidate,
                                  exact_score: event.target.value ? Number(event.target.value) : null
                                }
                              : candidate
                          )
                        }))
                      }
                      className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                    />
                    <input
                      value={item.score_band ?? ""}
                      onChange={(event) =>
                        setResult((current) => ({
                          ...current,
                          items: current.items.map((candidate) =>
                            candidate.id === item.id ? { ...candidate, score_band: event.target.value || null } : candidate
                          )
                        }))
                      }
                      className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                    />
                  </div>
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--navy)]">公开摘录</span>
                <textarea
                  rows={4}
                  value={item.public_excerpt ?? ""}
                  onChange={(event) =>
                    setResult((current) => ({
                      ...current,
                      items: current.items.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, public_excerpt: event.target.value || null } : candidate
                      )
                    }))
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7"
                />
              </label>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
                <label className="block">
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
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">访问级别</span>
                  <select
                    value={item.access_level}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id
                            ? { ...candidate, access_level: event.target.value as HighScoringExampleRecord["access_level"] }
                            : candidate
                        )
                      }))
                    }
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  >
                    {LIBRARY_ACCESS_LEVELS.map((option) => (
                      <option key={option} value={option}>
                        {LIBRARY_ACCESS_LEVEL_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">优势要点</span>
                  <textarea
                    rows={5}
                    value={toLines(item.strengths)}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id ? { ...candidate, strengths: parseLines(event.target.value) } : candidate
                        )
                      }))
                    }
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">薄弱点</span>
                  <textarea
                    rows={5}
                    value={toLines(item.weaknesses)}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id ? { ...candidate, weaknesses: parseLines(event.target.value) } : candidate
                        )
                      }))
                    }
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--navy)]">评语摘要</span>
                  <textarea
                    rows={5}
                    value={toLines(item.marker_comments_summary)}
                    onChange={(event) =>
                      setResult((current) => ({
                        ...current,
                        items: current.items.map((candidate) =>
                          candidate.id === item.id
                            ? { ...candidate, marker_comments_summary: parseLines(event.target.value) }
                            : candidate
                        )
                      }))
                    }
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7"
                  />
                </label>
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
            第 {result.page} / {result.page_count} 页，共 {result.total} 条样本
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
