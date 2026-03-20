import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProjectRecord } from "@/types/scholardesk";

export function ProjectCard({ project }: { project: ProjectRecord }) {
  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="h-full rounded-[28px] transition hover:-translate-y-0.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-950">{project.title}</h3>
          <Badge>{project.status}</Badge>
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div>{project.school}</div>
          <div>
            {project.module} · {project.assignmentType} · {project.language}
          </div>
        </div>
      </Card>
    </Link>
  );
}
