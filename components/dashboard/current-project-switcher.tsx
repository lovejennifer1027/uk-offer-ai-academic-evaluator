"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Select } from "@/components/ui/select";
import { CURRENT_PROJECT_COOKIE } from "@/lib/current-project-constants";
import type { Locale } from "@/types/scholardesk";

const projectScopedRoutes = new Set([
  "/dashboard/upload",
  "/dashboard/evaluate",
  "/dashboard/analyze-brief",
  "/dashboard/knowledge",
  "/dashboard/citations"
]);

function buildNextUrl(pathname: string, searchParams: URLSearchParams, projectId: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "dashboard" && segments[1] === "projects" && segments[2]) {
    return `/dashboard/projects/${projectId}`;
  }

  if (projectScopedRoutes.has(pathname)) {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("project", projectId);
    return `${pathname}?${nextParams.toString()}`;
  }

  return pathname;
}

export function CurrentProjectSwitcher({
  locale,
  currentProjectId,
  projects
}: {
  locale: Locale;
  currentProjectId: string | null;
  projects: { id: string; title: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="min-w-[220px]">
      <div className="mb-1 text-xs font-medium text-slate-500">{locale === "en" ? "Current project" : "当前项目"}</div>
      <Select
        value={currentProjectId ?? projects[0]?.id ?? ""}
        onChange={(event) => {
          const nextProjectId = event.target.value;
          document.cookie = `${CURRENT_PROJECT_COOKIE}=${nextProjectId}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
          router.push(buildNextUrl(pathname, new URLSearchParams(searchParams.toString()), nextProjectId));
          router.refresh();
        }}
        className="rounded-full border-white/70 bg-white/86 py-2.5 text-sm font-medium text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}
          </option>
        ))}
      </Select>
    </div>
  );
}
