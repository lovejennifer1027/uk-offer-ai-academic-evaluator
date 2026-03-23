import { redirect } from "next/navigation";

import { AcademicKnowledgeManager } from "@/components/admin/academic-knowledge-manager";
import { Card } from "@/components/ui/card";
import { getOptionalSessionUser } from "@/lib/session";
import { listSchoolKnowledgeFiles } from "@/services/store/local-store";

export default async function AdminAcademicKnowledgePage() {
  const user = await getOptionalSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const files = await listSchoolKnowledgeFiles();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7ff_0%,#fafbff_100%)] px-5 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="rounded-[30px]">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">School knowledge backend</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Upload and index school-level module briefs, rubrics, lecture notes, and course guidance here. These files are retrieved alongside student project documents during school-specific evaluation.
          </p>
        </Card>
        <AcademicKnowledgeManager initialFiles={files} />
      </div>
    </div>
  );
}
