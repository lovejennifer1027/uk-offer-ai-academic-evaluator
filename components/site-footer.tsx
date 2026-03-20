import Link from "next/link";

import { FORMATIVE_DISCLAIMER, ORGANISATION_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="pb-8 pt-4 text-[var(--navy)]">
      <div className="page-container">
        <div className="footer-shell grid gap-6 rounded-[32px] px-6 py-10 md:grid-cols-[1.3fr_0.7fr] md:items-end md:px-8">
          <div>
            <div className="text-sm font-semibold text-[var(--navy)]">
              {ORGANISATION_NAME}
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{FORMATIVE_DISCLAIMER}</p>
          </div>
          <div className="flex flex-wrap justify-start gap-3 text-sm text-[var(--muted)] md:justify-end">
            <Link href="/" className="nav-link">
              首页
            </Link>
            <Link href="/evaluate" className="nav-link">
              开始评估
            </Link>
            <Link href="/library" className="nav-link">
              高分示例库
            </Link>
            <Link href="/history" className="nav-link">
              历史记录
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
