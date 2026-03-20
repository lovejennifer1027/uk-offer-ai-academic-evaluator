import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockSearchResults = [
  {
    title: "Strategic responses to market uncertainty in cross-border expansion",
    meta: "Journal article · 2024",
    summary: "Useful for comparing risk framing, market sequencing, and evidence-based recommendation structure."
  },
  {
    title: "A review of SME internationalization pathways",
    meta: "Review paper · 2023",
    summary: "Helpful for building literature context and comparing staged versus rapid internationalization models."
  }
];

export default function SearchWorkspacePage() {
  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Academic search workspace</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">This first version uses mock results, but the layout is ready for future academic search API integration.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Search className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Input placeholder="Search sources or keywords" className="md:col-span-2" />
          <Select defaultValue="">
            <option value="">Year</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </Select>
          <Select defaultValue="">
            <option value="">Type</option>
            <option value="journal">Journal article</option>
            <option value="review">Review paper</option>
          </Select>
        </div>
      </Card>

      <div className="grid gap-5">
        {mockSearchResults.map((result) => (
          <Card key={result.title} className="rounded-[28px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{result.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{result.meta}</p>
              </div>
              <Button variant="secondary">Save to project</Button>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{result.summary}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
