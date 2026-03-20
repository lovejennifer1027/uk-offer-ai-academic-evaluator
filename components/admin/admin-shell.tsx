import Link from "next/link";
import type { ReactNode } from "react";

import { PageShell } from "@/components/page-shell";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

const adminNavItems = [
  { href: "/admin/universities", label: "大学" },
  { href: "/admin/sources", label: "来源站点" },
  { href: "/admin/crawls", label: "抓取记录" },
  { href: "/admin/normalization", label: "归一化" },
  { href: "/admin/examples", label: "高分样本" },
  { href: "/admin/rubrics", label: "评分标准" },
  { href: "/admin/library-sync", label: "同步面板" }
];

interface AdminShellProps {
  currentPath: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AdminShell({ currentPath, title, description, children }: AdminShellProps) {
  return (
    <PageShell>
      <section className="page-container py-12 md:py-16">
        <div className="card-surface rounded-[38px] p-6 md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <span className="eyebrow-pill text-sm font-semibold">写作样本库后台</span>
              <h1 className="mt-5 text-3xl text-[var(--navy)] md:text-4xl">{title}</h1>
              <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{description}</p>
            </div>
            <AdminLogoutButton />
          </div>

          <div className="mt-7 flex flex-wrap gap-2 rounded-[28px] border border-[var(--line)] bg-white/75 p-2">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  currentPath === item.href
                    ? "bg-[var(--navy)] text-white shadow-[0_16px_30px_rgba(67,84,120,0.16)]"
                    : "text-[var(--muted)] hover:bg-[rgba(160,189,229,0.12)] hover:text-[var(--navy)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8">{children}</div>
      </section>
    </PageShell>
  );
}
