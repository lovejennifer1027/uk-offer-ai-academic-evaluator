"use client";

import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { FileTable } from "@/components/dashboard/file-table";
import { ChatInterface } from "@/components/dashboard/chat-interface";
import { SourceCitationPanel } from "@/components/dashboard/source-citation-panel";
import type { ChatMessageRecord, EvaluationReportRecord, ProjectRecord, UploadedFileRecord } from "@/types/scholardesk";

const tabs = ["Overview", "Files", "Rubric", "AI Chat", "Evaluation Report", "Citations", "Settings"] as const;

export function ProjectWorkspaceTabs({
  project,
  files,
  reports,
  messages
}: {
  project: ProjectRecord;
  files: UploadedFileRecord[];
  reports: EvaluationReportRecord[];
  messages: ChatMessageRecord[];
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const latestReport = reports[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/70 bg-white/70 p-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" ? (
        <Card className="rounded-[30px]">
          <h3 className="text-xl font-semibold text-slate-950">{project.title}</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {project.school} · {project.module} · {project.assignmentType} · {project.language}
          </p>
        </Card>
      ) : null}

      {activeTab === "Files" ? <FileTable files={files} /> : null}

      {activeTab === "Rubric" ? (
        <Card className="rounded-[30px]">
          <h3 className="text-xl font-semibold text-slate-950">Rubric workspace</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">Upload the assignment brief or rubric from the Upload tab, then analyze it from the Analyze Brief workspace.</p>
        </Card>
      ) : null}

      {activeTab === "AI Chat" ? <ChatInterface projectId={project.id} initialMessages={messages} language={project.language} /> : null}

      {activeTab === "Evaluation Report" ? (
        latestReport ? (
          <Card className="rounded-[30px]">
            <h3 className="text-xl font-semibold text-slate-950">Latest evaluation report</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">{latestReport.jsonReport.overallSummary}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <Link href={`/dashboard/projects/${project.id}/print`} className="text-indigo-600 hover:text-indigo-800">
                Print-friendly view
              </Link>
              <Link href={`/api/projects/${project.id}/markdown`} className="text-indigo-600 hover:text-indigo-800">
                Export markdown
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="rounded-[30px]">
            <h3 className="text-xl font-semibold text-slate-950">Evaluation Report</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">No evaluation report has been generated yet.</p>
          </Card>
        )
      ) : null}

      {activeTab === "Citations" ? (
        <SourceCitationPanel items={latestReport?.jsonReport.sourcesUsed ?? []} />
      ) : null}

      {activeTab === "Settings" ? (
        <Card className="rounded-[30px]">
          <h3 className="text-xl font-semibold text-slate-950">Project settings</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">Project status, language, and assignment metadata can be managed here in the next iteration.</p>
        </Card>
      ) : null}
    </div>
  );
}
