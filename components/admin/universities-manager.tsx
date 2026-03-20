"use client";

import { useState } from "react";

import type { UniversityRecord } from "@/lib/library/types";

interface UniversitiesManagerProps {
  initialUniversities: UniversityRecord[];
}

interface UniversityFormState {
  name: string;
  short_name: string;
  country: string;
  website_url: string;
  logo_url: string;
  is_active: boolean;
}

const emptyUniversity: UniversityFormState = {
  name: "",
  short_name: "",
  country: "UK",
  website_url: "",
  logo_url: "",
  is_active: true
};

export function UniversitiesManager({ initialUniversities }: UniversitiesManagerProps) {
  const [items, setItems] = useState(initialUniversities);
  const [createForm, setCreateForm] = useState<UniversityFormState>(emptyUniversity);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createUniversity() {
    setError(null);
    const response = await fetch("/api/admin/universities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(createForm)
    });
    const payload = (await response.json().catch(() => null)) as { item?: UniversityRecord; error?: string } | null;

    if (!response.ok || !payload?.item) {
      setError(payload?.error ?? "创建大学记录失败。");
      return;
    }

    const createdItem = payload.item;
    setItems((current) => [...current, createdItem].sort((left, right) => left.name.localeCompare(right.name)));
    setCreateForm(emptyUniversity);
    setMessage("大学记录已创建。");
  }

  async function saveUniversity(item: UniversityRecord) {
    setError(null);
    const response = await fetch(`/api/admin/universities/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(item)
    });
    const payload = (await response.json().catch(() => null)) as { item?: UniversityRecord; error?: string } | null;

    if (!response.ok || !payload?.item) {
      setError(payload?.error ?? "更新大学记录失败。");
      return;
    }

    const savedItem = payload.item;
    setItems((current) => current.map((candidate) => (candidate.id === savedItem.id ? savedItem : candidate)));
    setMessage(`已保存 ${savedItem.name}。`);
  }

  return (
    <div className="space-y-6">
      <section className="card-surface rounded-[34px] p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">大学名称</span>
            <input
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">简称</span>
            <input
              value={createForm.short_name}
              onChange={(event) => setCreateForm((current) => ({ ...current, short_name: event.target.value }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">国家</span>
            <input
              value={createForm.country}
              onChange={(event) => setCreateForm((current) => ({ ...current, country: event.target.value }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[var(--navy)]">官网</span>
            <input
              value={createForm.website_url}
              onChange={(event) => setCreateForm((current) => ({ ...current, website_url: event.target.value }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">Logo URL</span>
            <input
              value={createForm.logo_url}
              onChange={(event) => setCreateForm((current) => ({ ...current, logo_url: event.target.value }))}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              checked={createForm.is_active}
              onChange={(event) => setCreateForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            启用该大学
          </label>

          <button type="button" onClick={() => void createUniversity()} className="luxury-button text-sm">
            添加大学
          </button>
        </div>
      </section>

      {message ? <div className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--navy)]">{message}</div> : null}
      {error ? <div className="rounded-[24px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">{error}</div> : null}

      <div className="grid gap-5">
        {items.map((item) => (
          <article key={item.id} className="card-surface rounded-[34px] p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">大学名称</span>
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
                <span className="text-sm font-semibold text-[var(--navy)]">简称</span>
                <input
                  value={item.short_name ?? ""}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, short_name: event.target.value || null } : candidate
                      )
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">国家</span>
                <input
                  value={item.country}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) => (candidate.id === item.id ? { ...candidate, country: event.target.value } : candidate))
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-[var(--navy)]">官网</span>
                <input
                  value={item.website_url ?? ""}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, website_url: event.target.value || null } : candidate
                      )
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">Logo URL</span>
                <input
                  value={item.logo_url ?? ""}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, logo_url: event.target.value || null } : candidate
                      )
                    )
                  }
                  className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>
            </div>

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
              <button type="button" onClick={() => void saveUniversity(item)} className="luxury-button-muted text-sm">
                保存修改
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
