import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/app-shell";
import { resolveCurrentProject } from "@/lib/current-project";
import { getLocale } from "@/lib/i18n";
import { getOptionalSessionUser } from "@/lib/session";
import { listProjectsByUser } from "@/services/store/local-store";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const user = await getOptionalSessionUser();

  if (!user) {
    redirect("/login");
  }

  const projects = await listProjectsByUser(user.id);
  const currentProject = await resolveCurrentProject(projects);

  return (
    <AppShell
      locale={locale}
      title={locale === "en" ? "Dashboard" : "工作台"}
      userName={user.name}
      projects={projects.map((project) => ({ id: project.id, title: project.title }))}
      currentProjectId={currentProject?.id ?? null}
    >
      {children}
    </AppShell>
  );
}
