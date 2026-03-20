"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AppealOrganizer() {
  const [issue, setIssue] = useState("");
  const [timeline, setTimeline] = useState("");
  const [summary, setSummary] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card className="rounded-[32px]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Appeal evidence organizer</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Organize supporting documents, build a timeline, and prepare a review-ready summary. This workspace offers drafting support only and does not provide legal advice.
        </p>
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-800">Issue category</label>
            <Input value={issue} onChange={(event) => setIssue(event.target.value)} className="mt-2" placeholder="e.g. grading discrepancy, process concern" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-800">Timeline notes</label>
            <Textarea value={timeline} onChange={(event) => setTimeline(event.target.value)} className="mt-2 min-h-[180px]" />
          </div>
          <Button onClick={() => setSummary(`Issue: ${issue}\n\nTimeline:\n${timeline}`)} className="w-full">
            Build draft summary
          </Button>
        </div>
      </Card>

      <Card className="rounded-[32px]">
        <h3 className="text-xl font-semibold text-slate-950">Draft summary</h3>
        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          {summary || "A structured, review-ready summary of facts and supporting evidence will appear here."}
        </div>
      </Card>
    </div>
  );
}
