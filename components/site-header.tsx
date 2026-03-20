import Link from "next/link";

import { BRAND_NAME, ORGANISATION_NAME } from "@/lib/constants";

const links = [
  { href: "/", label: "首页" },
  { href: "/evaluate", label: "开始评估" },
  { href: "/library", label: "高分示例库" },
  { href: "/history", label: "历史记录" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-50">
      <div className="page-container">
        <div className="site-header-shell flex flex-col gap-4 rounded-[28px] px-4 py-4 md:min-h-22 md:flex-row md:items-center md:justify-between md:px-5">
          <Link href="/" className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-[20px] border border-[rgba(59,76,107,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,241,250,0.92))] font-semibold tracking-[0.08em] text-[var(--navy)] shadow-[0_14px_28px_rgba(67,84,120,0.08)]">
              UK
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--navy)]">{BRAND_NAME}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">{ORGANISATION_NAME}</div>
            </div>
          </Link>

          <nav
            aria-label="主导航"
            className="nav-pill flex w-full flex-wrap items-center gap-x-1 gap-y-1 text-sm text-[var(--muted)] md:w-auto md:justify-center"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href="/evaluate" className="luxury-button w-full justify-center text-sm md:w-auto">
            立即评估
          </Link>
        </div>
      </div>
    </header>
  );
}
