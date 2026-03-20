import { UploadDropzone } from "@/components/dashboard/upload-dropzone";
import { FileTable } from "@/components/dashboard/file-table";
import { Card } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/session";
import { listFilesByProject, listProjectsByUser } from "@/services/store/local-store";

export default async function UploadPage() {
  const user = await requireSessionUser();
  const projects = await listProjectsByUser(user.id);
  const project = projects[0];
  const files = project ? await listFilesByProject(project.id) : [];

  return (
    <div className="space-y-6">
      {project ? (
        <UploadDropzone projectId={project.id} />
      ) : (
        <Card className="rounded-[30px]">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Start with a project</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Uploads are attached to a project so ScholarDesk can keep files, chats, reports, and citations in one workspace.
          </p>
        </Card>
      )}
      <FileTable files={files} />
    </div>
  );
}
