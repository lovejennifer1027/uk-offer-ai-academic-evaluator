import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { NormalizationManager } from "@/components/admin/normalization-manager";
import { PageShell } from "@/components/page-shell";
import { assertAdminPageAccess } from "@/lib/admin/auth";
import { listNormalizationRuns } from "@/lib/library/repository";

export const dynamic = "force-dynamic";

export default async function AdminNormalizationPage() {
  const access = await assertAdminPageAccess();

  if (!access.allowed) {
    return (
      <PageShell>
        <AdminAccessGate message={access.reason} />
      </PageShell>
    );
  }

  const result = await listNormalizationRuns(1, 20);

  return (
    <AdminShell
      currentPath="/admin/normalization"
      title="归一化队列"
      description="查看归一化任务状态、模型信息、token 使用与原始模型响应，并支持失败任务重试。"
    >
      <NormalizationManager initialResult={result} />
    </AdminShell>
  );
}
