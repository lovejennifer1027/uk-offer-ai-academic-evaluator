"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { ProjectFileCategory } from "@/types/scholardesk";

export function UploadDropzone({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<ProjectFileCategory>("other");

  async function handleChange(file: File | null) {
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("category", category);
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Upload failed.");
      }

      setMessage(payload?.message ?? "Upload completed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[30px] border-dashed p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-950">Upload paper, brief, or notes</h3>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
          Supported file types: pdf, docx, txt, md. Files are extracted, chunked, and prepared for retrieval-assisted AI workflows.
        </p>
        <div className="mt-5 w-full max-w-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Material type</label>
          <Select value={category} onChange={(event) => setCategory(event.target.value as ProjectFileCategory)}>
            <option value="essay">Essay / paper</option>
            <option value="brief">Brief / rubric</option>
            <option value="notes">Notes / lecture materials</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <label className="mt-6">
          <input type="file" className="hidden" onChange={(event) => handleChange(event.target.files?.[0] ?? null)} />
          <Button disabled={loading}>{loading ? "Uploading..." : "Choose file"}</Button>
        </label>
        {message ? <p className="mt-4 text-sm text-slate-500">{message}</p> : null}
      </div>
    </Card>
  );
}
