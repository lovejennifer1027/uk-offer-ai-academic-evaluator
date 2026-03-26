"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const assignmentTypes = [
  { value: "essay", label: "Essay" },
  { value: "report", label: "Report" },
  { value: "dissertation", label: "Dissertation" },
  { value: "reflection", label: "Reflection" },
  { value: "proposal", label: "Proposal" },
  { value: "presentation", label: "Presentation" }
] as const;

const languages = [
  { value: "en", label: "English" },
  { value: "zh", label: "Chinese" },
  { value: "bilingual", label: "Bilingual" }
] as const;

export function CreateProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [school, setSchool] = useState("");
  const [programme, setProgramme] = useState("");
  const [module, setModule] = useState("");
  const [assignmentType, setAssignmentType] = useState<(typeof assignmentTypes)[number]["value"]>("essay");
  const [language, setLanguage] = useState<(typeof languages)[number]["value"]>("en");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !school.trim() || !programme.trim() || !module.trim()) {
      setErrorMessage("请先完整填写项目标题、学校、programme 和 module。");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title.trim(),
          school: school.trim(),
          programme: programme.trim(),
          module: module.trim(),
          assignmentType,
          language
        })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; project?: { id: string } } | null;

      if (!response.ok || !payload?.project?.id) {
        throw new Error(payload?.error ?? "创建项目失败，请稍后重试。");
      }

      router.push(`/dashboard/projects/${payload.project.id}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "创建项目失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="rounded-[30px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Create project</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Add a new project with school, programme, module, assignment type, and language. The newest project will immediately become available to the evaluation flow.
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Project title"
            disabled={submitting}
          />
          <Input
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            placeholder="School"
            disabled={submitting}
          />
          <Input
            value={programme}
            onChange={(event) => setProgramme(event.target.value)}
            placeholder="Programme"
            disabled={submitting}
          />
          <Input
            value={module}
            onChange={(event) => setModule(event.target.value)}
            placeholder="Module"
            disabled={submitting}
          />
          <Select value={assignmentType} onChange={(event) => setAssignmentType(event.target.value as (typeof assignmentTypes)[number]["value"])} disabled={submitting}>
            {assignmentTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select value={language} onChange={(event) => setLanguage(event.target.value as (typeof languages)[number]["value"])} disabled={submitting}>
            {languages.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create project"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
