import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, BookOpen, FileSearch, FolderKanban, LayoutDashboard, Search, Shield, UploadCloud } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/scholardesk";

const sidebarItems = [
  { href: "/dashboard", label: { en: "Overview", zh: "概览" }, icon: LayoutDashboard },
  { href: "/dashboard/projects", label: { en: "Projects", zh: "项目" }, icon: FolderKanban },
  { href: "/dashboard/upload", label: { en: "Upload", zh: "上传" }, icon: UploadCloud },
  { href: "/dashboard/knowledge", label: { en: "Knowledge", zh: "知识库" }, icon: BookOpen },
  { href: "/dashboard/evaluate", label: { en: "Evaluate", zh: "评估" }, icon: BarChart3 },
  { href: "/dashboard/analyze-brief", label: { en: "Analyze Brief", zh: "分析要求" }, icon: FileSearch },
  { href: "/dashboard/citations", label: { en: "Citations", zh: "引用" }, icon: Search },
  { href: "/dashboard/search", label: { en: "Search Workspace", zh: "检索" }, icon: Search },
  { href: "/dashboard/appeal", label: { en: "Appeal Organizer", zh: "申诉整理" }, icon: Shield }
];

export function AppShell({
  locale,
  title,
  userName,
  children
}: {
  locale: Locale;
  title: string;
  userName: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-3 pb-3 pt-3 md:px-5">
      <div className="mx-auto grid min-h-screen w-full max-w-[1620px] gap-4 lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="story-shell hidden rounded-[34px] px-5 py-6 lg:block">
          <Link href="/" className="flex items-center gap-3 rounded-[28px] bg-[linear-gradient(135deg,#20283e,#3b4e7a)] px-4 py-4 text-white shadow-[0_20px_40px_rgba(31,42,68,0.22)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 font-semibold">SD</div>
            <div>
              <div className="text-sm font-semibold">ScholarDesk AI</div>
              <div className="text-xs text-white/70">{locale === "en" ? "Academic support" : "学术支持"}</div>
            </div>
          </Link>

          <nav className="mt-8 space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-medium text-slate-600 transition duration-200 hover:bg-white/88 hover:text-slate-950 hover:shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{locale === "en" ? item.label.en : item.label.zh}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="site-header-shell sticky top-3 z-30 rounded-[30px]">
            <div className="px-5 py-4 md:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">{locale === "en" ? "Workspace" : "工作台"}</div>
                  <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <LanguageSwitcher locale={locale} />
                  <div className="hidden rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 md:block">
                    {userName}
                  </div>
                  <LogoutButton locale={locale} />
                  <Link href="/tools">
                    <Button variant="secondary">{locale === "en" ? "Tool hub" : "工具中心"}</Button>
                  </Link>
                </div>
              </div>

              <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap rounded-full border border-white/80 bg-white/86 px-4 py-2 text-sm font-medium text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:text-slate-950"
                  >
                    {locale === "en" ? item.label.en : item.label.zh}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="min-w-0 flex-1 py-4">
            <div className="story-shell min-h-full rounded-[34px] px-5 py-6 md:px-6 md:py-7">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
