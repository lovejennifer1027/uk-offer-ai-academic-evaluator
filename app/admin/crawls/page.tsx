import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { CrawlsManager } from "@/components/admin/crawls-manager";
import { PageShell } from "@/components/page-shell";
import { assertAdminPageAccess } from "@/lib/admin/auth";
import { listCrawlRunsPaginated } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

export default async function AdminCrawlsPage() {
  const access = await assertAdminPageAccess();

  if (!access.allowed) {
    return (
      <PageShell>
        <AdminAccessGate message={access.reason} />
      </PageShell>
    );
  }

  const crawls = await listCrawlRunsPaginated(1, 20);

  return (
    <AdminShell
      currentPath="/admin/crawls"
      title="抓取记录"
      description="查看 crawl 历史、运行统计和失败日志，并手动触发新的全库同步。"
    >
      <CrawlsManager initialResult={crawls} />
    </AdminShell>
  );
}
