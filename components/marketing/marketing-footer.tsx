import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/types/scholardesk";

export function MarketingFooter({
  locale,
  nav
}: {
  locale: Locale;
  nav: Array<{ href: string; label: string }>;
}) {
  return (
    <footer className="border-t border-white/60 bg-white/70">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.1fr_0.75fr_0.75fr_0.8fr] md:px-8">
        <div>
          <div className="text-xl font-semibold text-slate-950">ScholarDesk AI</div>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
            {locale === "en"
              ? "A compliant academic productivity platform for evaluation, research review, citations, and project knowledge-base workflows."
              : "一个合规的学术效率平台，支持评估、资料回顾、引用整理与项目知识库工作流。"}
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-950">{locale === "en" ? "Product" : "产品"}</div>
          <div className="mt-4 space-y-3">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="block text-sm text-slate-600 transition hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-950">{locale === "en" ? "Legal" : "法律信息"}</div>
          <div className="mt-4 space-y-3">
            <Link href="/legal/privacy" className="block text-sm text-slate-600 transition hover:text-slate-950">
              {locale === "en" ? "Privacy" : "隐私说明"}
            </Link>
            <Link href="/legal/terms" className="block text-sm text-slate-600 transition hover:text-slate-950">
              {locale === "en" ? "Terms" : "使用条款"}
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-950">{locale === "en" ? "Contact" : "联系"}</div>
          <a href="mailto:hello@scholardesk.ai" className="block text-sm text-slate-600 transition hover:text-slate-950">
            hello@scholardesk.ai
          </a>
          <div className="text-sm font-semibold text-slate-950">{locale === "en" ? "Language" : "语言"}</div>
          <LanguageSwitcher locale={locale} />
          <div className="text-sm leading-7 text-slate-500">
            {locale === "en" ? "No public sharing by default. Delete files any time." : "默认不公开分享。文件可随时删除。"}
          </div>
        </div>
      </div>
    </footer>
  );
}
