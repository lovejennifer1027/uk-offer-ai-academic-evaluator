import { Card } from "@/components/ui/card";

export function StatsStrip({ items }: { items: Array<{ value: string; label: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.value} className="rounded-[26px] bg-white/80 p-5">
          <div className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">{item.value}</div>
          <p className="mt-2 text-sm text-slate-600">{item.label}</p>
        </Card>
      ))}
    </div>
  );
}
