import { Card } from "@/components/ui/card";

export function ReportScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-[26px] p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{value}</div>
    </Card>
  );
}
