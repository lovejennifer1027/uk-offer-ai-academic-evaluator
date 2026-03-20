import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileTable } from "@/components/dashboard/file-table";
import { requireSessionUser } from "@/lib/session";
import { listFilesByProject, listProjectsByUser } from "@/services/store/local-store";

export default async function KnowledgePage() {
  const user = await requireSessionUser();
  const projects = await listProjectsByUser(user.id);
  const project = projects[0];
  const files = project ? await listFilesByProject(project.id) : [];

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Knowledge base</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Uploaded documents, vector retrieval status, and reindex-ready file records appear here.</p>
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <Input placeholder="Search uploaded documents" />
          <div className="flex gap-2">
            <Button variant="secondary">Essay</Button>
            <Button variant="secondary">Brief</Button>
            <Button variant="secondary">Notes</Button>
          </div>
        </div>
      </Card>
      {!project ? (
        <Card className="rounded-[30px]">
          <h3 className="text-lg font-semibold text-slate-950">No project selected</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Create or open a project first to build a knowledge base, index documents, and ask grounded questions over uploaded materials.
          </p>
        </Card>
      ) : null}
      <FileTable files={files} />
    </div>
  );
}
