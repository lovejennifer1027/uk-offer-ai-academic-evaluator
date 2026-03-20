"use client";

import { useState } from "react";

import {
  LIBRARY_CRAWL_FREQUENCIES,
  LIBRARY_PARSER_TYPES,
  LIBRARY_SOURCE_TYPES
} from "@/lib/library/constants";
import type { SourceSiteRecord, UniversityRecord } from "@/lib/library/types";

interface SourcesManagerProps {
  initialSources: SourceSiteRecord[];
  universities: UniversityRecord[];
}

const emptySource = {
  university_id: "",
  name: "",
  base_url: "",
  source_type: LIBRARY_SOURCE_TYPES[0],
  parser_type: LIBRARY_PARSER_TYPES[0],
  is_active: true,
  crawl_frequency: LIBRARY_CRAWL_FREQUENCIES[1],
  notes: ""
};

export function SourcesManager({ initialSources, universities }: SourcesManagerProps) {
  const [items, setItems] = useState(initialSources);
  const [form, setForm] = useState(emptySource);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createSource() {
    setError(null);
    const response = await fetch("/api/admin/sources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });
    const payload = (await response.json().catch(() => null)) as { item?: SourceSiteRecord; error?: string } | null;

    if (!response.ok || !payload?.item) {
      setError(payload?.error ?? "创建 source 失败。");
      return;
    }

    setItems((current) => [payload.item!, ...current]);
    setForm(emptySource);
    setMessage("Source 已创建。");
  }

  async function saveSource(item: SourceSiteRecord) {
    setError(null);
    const response = await fetch(`/api/admin/sources/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(item)
    });
    const payload = (await response.json().catch(() => null)) as { item?: SourceSiteRecord; error?: string } | null;

    if (!response.ok || !payload?.item) {
      setError(payload?.error ?? "更新 source 失败。");
      return;
    }

    setItems((current) => current.map((candidate) => (candidate.id === payload.item!.id ? payload.item! : candidate)));
    setMessage(`已保存 ${payload.item.name}。`);
  }

  async function testCrawl(item: SourceSiteRecord) {
    setError(null);
    setMessage(`正在测试 crawl：${item.name}`);
    const response = await fetch(`/api/admin/sources/${item.id}/test-crawl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ max_pages: 6 })
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; result?: { crawl_run_id?: string } } | null;

    if (!response.ok) {
      setError(payload?.error ?? "测试 crawl 失败。");
      return;
    }

    setMessage(`测试 crawl 已触发，run id：${payload?.result?.crawl_run_id ?? "unknown"}`);
  }

  return (
    <div className="space-y-6">
      <section className="card-surface rounded-[34px] p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">大学</span>
            <select
              value={form.university_id}
              onChange={(event) => setForm((current) => ({ ...current, university_id: event.target.value }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >
              <option value="">选择大学</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">来源名称</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">基础 URL</span>
            <input
              value={form.base_url}
              onChange={(event) => setForm((current) => ({ ...current, base_url: event.target.value }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">来源类型</span>
            <select
              value={form.source_type}
              onChange={(event) => setForm((current) => ({ ...current, source_type: event.target.value as typeof form.source_type }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >
              {LIBRARY_SOURCE_TYPES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">解析方式</span>
            <select
              value={form.parser_type}
              onChange={(event) => setForm((current) => ({ ...current, parser_type: event.target.value as typeof form.parser_type }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >
              {LIBRARY_PARSER_TYPES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">同步频率</span>
            <select
              value={form.crawl_frequency}
              onChange={(event) => setForm((current) => ({ ...current, crawl_frequency: event.target.value as typeof form.crawl_frequency }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >
              {LIBRARY_CRAWL_FREQUENCIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-[var(--navy)]">备注</span>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </label>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            Source 已启用
          </label>
          <button type="button" onClick={() => void createSource()} className="luxury-button text-sm">添加 Source</button>
        </div>
      </section>

      {message ? <div className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--navy)]">{message}</div> : null}
      {error ? <div className="rounded-[24px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">{error}</div> : null}

      <div className="grid gap-5">
        {items.map((item) => (
          <article key={item.id} className="card-surface rounded-[34px] p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">大学</span>
                <select
                  value={item.university_id}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, university_id: event.target.value } : candidate
                      )
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                >
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>{university.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">来源名称</span>
                <input
                  value={item.name}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) => (candidate.id === item.id ? { ...candidate, name: event.target.value } : candidate))
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">基础 URL</span>
                <input
                  value={item.base_url}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) => (candidate.id === item.id ? { ...candidate, base_url: event.target.value } : candidate))
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">来源类型</span>
                <select
                  value={item.source_type}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, source_type: event.target.value as SourceSiteRecord["source_type"] } : candidate
                      )
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                >
                  {LIBRARY_SOURCE_TYPES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">解析方式</span>
                <select
                  value={item.parser_type}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, parser_type: event.target.value as SourceSiteRecord["parser_type"] } : candidate
                      )
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                >
                  {LIBRARY_PARSER_TYPES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">同步频率</span>
                <select
                  value={item.crawl_frequency}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id
                          ? { ...candidate, crawl_frequency: event.target.value as SourceSiteRecord["crawl_frequency"] }
                          : candidate
                      )
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                >
                  {LIBRARY_CRAWL_FREQUENCIES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="quiet-badge">{item.source_type}</span>
              <span className="quiet-badge">{item.parser_type}</span>
              <span className="quiet-badge">{item.crawl_frequency}</span>
              {item.last_crawled_at ? <span className="quiet-badge">最近 crawl：{new Date(item.last_crawled_at).toLocaleString("zh-CN")}</span> : null}
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[var(--navy)]">备注</span>
              <textarea
                rows={3}
                value={item.notes ?? ""}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((candidate) => (candidate.id === item.id ? { ...candidate, notes: event.target.value } : candidate))
                  )
                }
                className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-3 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, is_active: event.target.checked } : candidate
                      )
                    )
                  }
                />
                当前启用
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => void testCrawl(item)} className="luxury-button-muted text-sm">测试 Crawl</button>
                <button type="button" onClick={() => void saveSource(item)} className="luxury-button text-sm">保存修改</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
