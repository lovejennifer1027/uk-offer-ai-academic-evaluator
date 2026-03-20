import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { ExamplesManager } from "@/components/admin/examples-manager";
import { PageShell } from "@/components/page-shell";
import { assertAdminPageAccess } from "@/lib/admin/auth";
import { listExamples, listUniversities } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

export default async function AdminExamplesPage() {
  const access = await assertAdminPageAccess();

  if (!access.allowed) {
    return (
      <PageShell>
        <AdminAccessGate message={access.reason} />
      </PageShell>
    );
  }

  const [result, universities] = await Promise.all([
    listExamples({
      page: 1,
      page_size: 20
    }),
    listUniversities()
  ]);

  return (
    <AdminShell
      currentPath="/admin/examples"
      title="高分样本"
      description="搜索和编辑已抽取的高分写作样本，按大学、院系和分数段筛选，并进行核验。"
    >
      <ExamplesManager initialResult={result} universities={universities} />
    </AdminShell>
  );
}
