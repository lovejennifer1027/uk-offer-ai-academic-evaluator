"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReportScoreCard } from "@/components/dashboard/report-score-card";
import { SourceCitationPanel } from "@/components/dashboard/source-citation-panel";
import type { CitationStyle, EvaluationReportJson, ProjectLanguage } from "@/types/scholardesk";

export function EvaluationWorkspace({
  projectId,
  language
}: {
  projectId: string;
  language: ProjectLanguage;
}) {
  const [paperText, setPaperText] = useState("");
  const [rubricText, setRubricText] = useState("");
  const [targetLevel, setTargetLevel] = useState("Master's");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("Harvard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ overallScore: number; jsonReport: EvaluationReportJson } | null>(null);

  async function handleSubmit() {
    setLoading(true);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          paperText,
          rubricText,
          targetLevel,
          citationStyle,
          language
        })
      });

      const payload = (await response.json()) as { overallScore: number; jsonReport: EvaluationReportJson };
      setResult(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-[32px]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Paper evaluation</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Paste a draft or extracted paper text, add rubric guidance if available, and generate a structured revision report.
        </p>
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-800">Paper text</label>
            <Textarea value={paperText} onChange={(event) => setPaperText(event.target.value)} className="mt-2 min-h-[220px]" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-800">Rubric / requirements</label>
            <Textarea value={rubricText} onChange={(event) => setRubricText(event.target.value)} className="mt-2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-800">Target level</label>
              <Input value={targetLevel} onChange={(event) => setTargetLevel(event.target.value)} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-800">Citation style</label>
              <Select value={citationStyle} onChange={(event) => setCitationStyle(event.target.value as CitationStyle)} className="mt-2">
                {["APA", "MLA", "Harvard", "Chicago"].map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !paperText.trim()}>
            {loading ? "Generating report..." : "Generate evaluation"}
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        {result ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <ReportScoreCard label="Overall" value={result.overallScore} />
              {Object.entries(result.jsonReport.dimensionScores).slice(0, 2).map(([label, value]) => (
                <ReportScoreCard key={label} label={label} value={value} />
              ))}
            </div>
            <Card className="rounded-[32px]">
              <h3 className="text-xl font-semibold text-slate-950">Overall summary</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{result.jsonReport.overallSummary}</p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Strengths</h4>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                    {result.jsonReport.strengths.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Priority improvements</h4>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                    {result.jsonReport.priorityImprovements.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
            <SourceCitationPanel items={result.jsonReport.sourcesUsed} />
          </>
        ) : (
          <Card className="rounded-[32px]">
            <h3 className="text-xl font-semibold text-slate-950">Evaluation output</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              A structured report with dimension scores, revision checklist, tone notes, citation feedback, and evidence used will appear here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
