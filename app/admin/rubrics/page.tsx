import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { RubricsManager } from "@/components/admin/rubrics-manager";
import { PageShell } from "@/components/page-shell";
import { assertAdminPageAccess } from "@/lib/admin/auth";
import { listRubrics, listUniversities } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

export default async function AdminRubricsPage() {
  const access = await assertAdminPageAccess();

  if (!access.allowed) {
    return (
      <PageShell>
        <AdminAccessGate message={access.reason} />
      </PageShell>
    );
  }

  const [result, universities] = await Promise.all([
    listRubrics({
      page: 1,
      page_size: 20
    }),
    listUniversities()
  ]);

  return (
    <AdminShell
      currentPath="/admin/rubrics"
      title="评分标准管理"
      description="管理公开评分标准记录，支持文本修订、score ranges 预览、结构化 JSON 调整与人工核验。"
    >
      <RubricsManager initialResult={result} universities={universities} />
    </AdminShell>
  );
}
