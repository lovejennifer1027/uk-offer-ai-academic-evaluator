import Link from "next/link";

import { FORMATIVE_DISCLAIMER, ORGANISATION_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(59,76,107,0.08)] bg-[rgba(250,249,246,0.72)] text-[var(--navy)] backdrop-blur-xl">
      <div className="page-container grid gap-6 py-12 md:grid-cols-[1.3fr_0.7fr] md:items-end">
        <div>
          <div className="text-sm font-semibold text-[var(--navy)]">
            {ORGANISATION_NAME}
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{FORMATIVE_DISCLAIMER}</p>
        </div>
        <div className="flex flex-wrap justify-start gap-3 text-sm text-[var(--muted)] md:justify-end">
          <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-[rgba(160,189,229,0.14)] hover:text-[var(--navy)]">
            首页
          </Link>
          <Link href="/evaluate" className="rounded-full px-3 py-2 transition hover:bg-[rgba(160,189,229,0.14)] hover:text-[var(--navy)]">
            开始评估
          </Link>
          <Link href="/library" className="rounded-full px-3 py-2 transition hover:bg-[rgba(160,189,229,0.14)] hover:text-[var(--navy)]">
            写作样本库
          </Link>
          <Link href="/history" className="rounded-full px-3 py-2 transition hover:bg-[rgba(160,189,229,0.14)] hover:text-[var(--navy)]">
            历史记录
          </Link>
        </div>
      </div>
    </footer>
  );
}
