import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/app-shell";
import { getLocale } from "@/lib/i18n";
import { getOptionalSessionUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const user = await getOptionalSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell locale={locale} title={locale === "en" ? "Dashboard" : "工作台"} userName={user.name}>
      {children}
    </AppShell>
  );
}
