import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { UniversitiesManager } from "@/components/admin/universities-manager";
import { PageShell } from "@/components/page-shell";
import { assertAdminPageAccess } from "@/lib/admin/auth";
import { listUniversities } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

export default async function AdminUniversitiesPage() {
  const access = await assertAdminPageAccess();

  if (!access.allowed) {
    return (
      <PageShell>
        <AdminAccessGate message={access.reason} />
      </PageShell>
    );
  }

  const universities = await listUniversities();

  return (
    <AdminShell
      currentPath="/admin/universities"
      title="大学管理"
      description="管理写作样本库涉及的大学来源，支持启用、停用和基础资料编辑。"
    >
      <UniversitiesManager initialUniversities={universities} />
    </AdminShell>
  );
}
