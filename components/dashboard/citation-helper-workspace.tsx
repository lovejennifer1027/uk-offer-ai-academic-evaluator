"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CitationStyle } from "@/types/scholardesk";

export function CitationHelperWorkspace({ projectId }: { projectId?: string }) {
  const [rawText, setRawText] = useState("");
  const [style, setStyle] = useState<CitationStyle>("Harvard");
  const [entries, setEntries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleFormat() {
    setLoading(true);

    try {
      const response = await fetch("/api/citations/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, style, projectId })
      });
      const payload = (await response.json()) as { formattedEntries: string[] };
      setEntries(payload.formattedEntries);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card className="rounded-[32px]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Citation helper</h2>
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-800">Reference metadata</label>
            <Textarea value={rawText} onChange={(event) => setRawText(event.target.value)} className="mt-2 min-h-[220px]" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-800">Style</label>
            <Select value={style} onChange={(event) => setStyle(event.target.value as CitationStyle)} className="mt-2">
              {["APA", "MLA", "Harvard", "Chicago"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <Button className="w-full" onClick={handleFormat} disabled={loading || !rawText.trim()}>
            {loading ? "Formatting..." : "Format references"}
          </Button>
        </div>
      </Card>

      <Card className="rounded-[32px]">
        <h3 className="text-xl font-semibold text-slate-950">Formatted references</h3>
        <div className="mt-5 space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm leading-7 text-slate-600">Formatted references will appear here, ready to copy into your notes.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                {entry}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
