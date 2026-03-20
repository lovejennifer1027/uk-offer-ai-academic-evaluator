import { Card } from "@/components/ui/card";
import type { UploadedFileRecord } from "@/types/scholardesk";

export function FileTable({ files }: { files: UploadedFileRecord[] }) {
  if (files.length === 0) {
    return (
      <Card className="rounded-[30px]">
        <h3 className="text-lg font-semibold text-slate-950">No indexed files yet</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Upload project documents to see extraction status, embedding progress, and retrievable file records here.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-[30px] p-0">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-sm text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">File</th>
            <th className="px-5 py-4 font-medium">Extraction</th>
            <th className="px-5 py-4 font-medium">Embedding</th>
            <th className="px-5 py-4 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="border-t border-slate-100 text-sm text-slate-600">
              <td className="px-5 py-4">{file.filename}</td>
              <td className="px-5 py-4">{file.extractionStatus}</td>
              <td className="px-5 py-4">{file.embeddingStatus}</td>
              <td className="px-5 py-4">{new Date(file.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
