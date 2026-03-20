import { Card } from "@/components/ui/card";
import type { EvidenceSnippet } from "@/types/scholardesk";

export function SourceCitationPanel({ items }: { items: EvidenceSnippet[] }) {
  return (
    <Card className="rounded-[28px]">
      <h3 className="text-lg font-semibold text-slate-950">Evidence used</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-slate-500">No retrieved sources were used for this response.</div>
        ) : (
          items.map((item) => (
            <div key={`${item.fileId}-${item.snippet}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">{item.filename}</div>
              <div className="mt-2 text-sm leading-7 text-slate-600">{item.snippet}</div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
