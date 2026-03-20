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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7ff_0%,#fafafc_48%,#f5f7fb_100%)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/60 bg-[rgba(255,255,255,0.74)] px-5 py-6 backdrop-blur-xl lg:block">
          <Link href="/" className="flex items-center gap-3 rounded-3xl bg-slate-950 px-4 py-4 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 font-semibold">SD</div>
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
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{locale === "en" ? item.label.en : item.label.zh}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/60 bg-[rgba(245,247,255,0.86)] backdrop-blur-xl">
            <div className="px-5 py-4 md:px-8">
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
                    className="whitespace-nowrap rounded-full border border-white/70 bg-white/85 px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
                  >
                    {locale === "en" ? item.label.en : item.label.zh}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="min-w-0 flex-1 px-5 py-8 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
