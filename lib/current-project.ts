import "server-only";

import { cookies } from "next/headers";

import { CURRENT_PROJECT_COOKIE } from "@/lib/current-project-constants";
import type { ProjectRecord } from "@/types/scholardesk";

export async function getCurrentProjectIdFromCookie() {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENT_PROJECT_COOKIE)?.value?.trim();
  return value || null;
}

export async function resolveCurrentProject(projects: ProjectRecord[]) {
  const currentProjectId = await getCurrentProjectIdFromCookie();

  if (!currentProjectId) {
    return projects[0] ?? null;
  }

  return projects.find((project) => project.id === currentProjectId) ?? projects[0] ?? null;
}
