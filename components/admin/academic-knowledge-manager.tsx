"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { Building2, Database, FileStack, UploadCloud } from "lucide-react";

import { academicSchoolProfiles } from "@/config/academic-schools";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { SchoolKnowledgeFileRecord } from "@/types/scholardesk";

export function AcademicKnowledgeManager({
  initialFiles
}: {
  initialFiles: SchoolKnowledgeFileRecord[];
}) {
  const [selectedSchool, setSelectedSchool] = useState(academicSchoolProfiles[0]?.name ?? "");
  const [files, setFiles] = useState(initialFiles);
  const [uploadState, setUploadState] = useState<{ loading: boolean; message?: string; error?: string }>({
    loading: false
  });

  const filteredFiles = useMemo(() => {
    if (!selectedSchool) {
      return files;
    }

    return files.filter((file) => file.schoolName === selectedSchool);
  }, [files, selectedSchool]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !selectedSchool) {
      return;
    }

    setUploadState({ loading: true });

    try {
      const formData = new FormData();
      formData.append("school", selectedSchool);
      formData.append("file", file);

      const response = await fetch("/api/admin/academic-knowledge", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string; file?: SchoolKnowledgeFileRecord }
        | null;

      if (!response.ok || !payload?.file) {
        throw new Error(payload?.error ?? "上传失败，请稍后重试。");
      }

      setFiles((current) => [payload.file!, ...current]);
      setUploadState({
        loading: false,
        message: payload.message ?? "学校资料已上传并完成索引。"
      });
    } catch (error) {
      setUploadState({
        loading: false,
        error: error instanceof Error ? error.message : "上传失败，请稍后重试。"
      });
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="grid gap-5 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <div className="eyebrow-pill text-xs font-semibold">Academic knowledge admin</div>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950">学校资料库后台</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              把各学校的 module brief、lecture notes、rubric、课程说明和讲义上传到这里。评估模块会把这些学校资料和学生项目资料一起检索，再送给 GPT 输出更贴近学校要求的报告。
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
            <div className="text-sm font-semibold text-slate-900">当前上传学校</div>
            <Select value={selectedSchool} onChange={(event) => setSelectedSchool(event.target.value)} className="mt-3 rounded-[20px] border-white bg-white">
              {academicSchoolProfiles.map((school) => (
                <option key={school.id} value={school.name}>
                  {school.name}
                </option>
              ))}
            </Select>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
              <input type="file" className="hidden" onChange={handleFileChange} />
              <UploadCloud className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">{uploadState.loading ? "正在上传..." : "选择学校资料文件"}</span>
            </label>
            <div className="mt-3 text-xs leading-6 text-slate-500">
              当前自动提取支持 PDF / Word / TXT / Markdown。后续可继续扩展图片与 PPT。
            </div>
            {uploadState.message ? <div className="mt-3 text-sm font-medium text-emerald-700">{uploadState.message}</div> : null}
            {uploadState.error ? <div className="mt-3 text-sm font-medium text-rose-700">{uploadState.error}</div> : null}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          { label: "学校总数", value: String(academicSchoolProfiles.length), icon: Building2 },
          { label: "学校资料文件", value: String(files.length), icon: FileStack },
          { label: "当前学校文件", value: String(filteredFiles.length), icon: Database }
        ].map((item) => (
          <Card key={item.label} className="rounded-[28px]">
            <item.icon className="h-5 w-5 text-slate-500" />
            <div className="mt-4 text-sm text-slate-500">{item.label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{item.value}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-[30px] p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="text-lg font-semibold text-slate-950">学校资料文件</div>
          <div className="mt-2 text-sm text-slate-500">当前按所选学校过滤，便于持续往单个学校知识库里深化上传。</div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">School</th>
              <th className="px-5 py-4 font-medium">File</th>
              <th className="px-5 py-4 font-medium">Extraction</th>
              <th className="px-5 py-4 font-medium">Embedding</th>
              <th className="px-5 py-4 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.length === 0 ? (
              <tr className="border-t border-slate-100">
                <td colSpan={5} className="px-5 py-8 text-sm text-slate-500">
                  当前学校还没有资料文件。先选学校，再上传第一份课程资料。
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr key={file.id} className="border-t border-slate-100 text-sm text-slate-600">
                  <td className="px-5 py-4">{file.schoolName}</td>
                  <td className="px-5 py-4">{file.filename}</td>
                  <td className="px-5 py-4">{file.extractionStatus}</td>
                  <td className="px-5 py-4">{file.embeddingStatus}</td>
                  <td className="px-5 py-4">{new Date(file.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          刷新列表
        </Button>
      </div>
    </div>
  );
}
