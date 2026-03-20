import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/types/scholardesk";

export function MarketingHeader({
  locale,
  nav,
  loginLabel,
  ctaLabel
}: {
  locale: Locale;
  nav: Array<{ href: string; label: string }>;
  loginLabel: string;
  ctaLabel: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-[rgba(247,248,255,0.82)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-5 py-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-slate-950">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
              SD
            </div>
            <div>
              <div className="text-sm font-semibold">ScholarDesk AI</div>
              <div className="text-xs text-slate-500">
                {locale === "en" ? "Academic support workspace" : "学术支持工作台"}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 px-2 py-2 shadow-sm lg:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost">{loginLabel}</Button>
            </Link>
            <Link href="/signup">
              <Button>{ctaLabel}</Button>
            </Link>
          </div>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-200 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
