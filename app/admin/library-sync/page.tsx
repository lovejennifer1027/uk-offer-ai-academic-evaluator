import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { LibrarySyncPanel } from "@/components/admin/library-sync-panel";
import { PageShell } from "@/components/page-shell";
import { assertAdminPageAccess } from "@/lib/admin/auth";
import { getLibraryStatus } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

export default async function AdminLibrarySyncPage() {
  const access = await assertAdminPageAccess();

  if (!access.allowed) {
    return (
      <PageShell>
        <AdminAccessGate message={access.reason} />
      </PageShell>
    );
  }

  const status = await getLibraryStatus();

  return (
    <AdminShell
      currentPath="/admin/library-sync"
      title="同步面板"
      description="查看最近同步状态、已检查页面、变更页面、失败任务，并手动运行同步或重建 embeddings。"
    >
      <LibrarySyncPanel initialStatus={status} />
    </AdminShell>
  );
}
