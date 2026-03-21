import { Card } from "@/components/ui/card";

export function StatsStrip({ items }: { items: Array<{ value: string; label: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.value} className="rounded-[28px] p-5 md:p-6">
          <div className="text-[2rem] font-semibold tracking-[-0.05em] text-slate-950 md:text-[2.3rem]">{item.value}</div>
          <p className="mt-2 text-sm leading-7 text-slate-600">{item.label}</p>
        </Card>
      ))}
    </div>
  );
}
