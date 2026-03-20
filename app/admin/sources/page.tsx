import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { SourcesManager } from "@/components/admin/sources-manager";
import { PageShell } from "@/components/page-shell";
import { assertAdminPageAccess } from "@/lib/admin/auth";
import { listSourceSites, listUniversities } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const access = await assertAdminPageAccess();

  if (!access.allowed) {
    return (
      <PageShell>
        <AdminAccessGate message={access.reason} />
      </PageShell>
    );
  }

  const [sources, universities] = await Promise.all([listSourceSites(), listUniversities()]);

  return (
    <AdminShell
      currentPath="/admin/sources"
      title="来源站点"
      description="配置受控的公开来源列表，定义 crawl 频率、parser 类型和测试同步入口。"
    >
      <SourcesManager initialSources={sources} universities={universities} />
    </AdminShell>
  );
}
