"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { BriefAnalysisJson, ProjectLanguage } from "@/types/scholardesk";

export function BriefAnalyzerForm({ language }: { language: ProjectLanguage }) {
  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [rubricText, setRubricText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BriefAnalysisJson | null>(null);

  async function analyze() {
    setLoading(true);

    try {
      const response = await fetch("/api/analyze-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentPrompt, rubricText, language })
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-[32px]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Assignment brief analyzer</h2>
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-800">Assignment prompt</label>
            <Textarea value={assignmentPrompt} onChange={(event) => setAssignmentPrompt(event.target.value)} className="mt-2 min-h-[200px]" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-800">Rubric text</label>
            <Textarea value={rubricText} onChange={(event) => setRubricText(event.target.value)} className="mt-2" />
          </div>
          <Button className="w-full" onClick={analyze} disabled={loading || !assignmentPrompt.trim()}>
            {loading ? "Analyzing..." : "Analyze brief"}
          </Button>
        </div>
      </Card>

      <Card className="rounded-[32px]">
        <h3 className="text-xl font-semibold text-slate-950">Analysis output</h3>
        {result ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[
              { title: "Assignment type", list: [result.assignmentType] },
              { title: "Expected structure", list: result.expectedStructure },
              { title: "Key deliverables", list: result.keyDeliverables },
              { title: "Marking priorities", list: result.markingPriorities },
              { title: "Likely pitfalls", list: result.likelyPitfalls },
              { title: "Recommended outline", list: result.recommendedOutline },
              { title: "Suggested research questions", list: result.suggestedResearchQuestions }
            ].map(({ title, list }) => (
              <div key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{title}</div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                  {list.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Structure expectations, deliverables, pitfalls, outline suggestions, and research-question prompts will appear here.
          </p>
        )}
      </Card>
    </div>
  );
}
