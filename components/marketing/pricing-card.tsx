import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PricingCard({
  tier,
  ctaLabel
}: {
  tier: { name: string; price: string; description: string; features: string[]; highlighted?: boolean };
  ctaLabel: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[32px] p-8",
        tier.highlighted && "border-indigo-300 bg-[linear-gradient(180deg,rgba(238,242,255,0.88),rgba(255,255,255,0.96))]"
      )}
    >
      <div className="text-lg font-semibold text-slate-950">{tier.name}</div>
      <div className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">{tier.price}</div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{tier.description}</p>
      <div className="mt-6 space-y-3">
        {tier.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3 text-sm text-slate-600">
            <Check className="mt-0.5 h-4 w-4 text-indigo-600" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <Button className="mt-8 w-full">{ctaLabel}</Button>
    </Card>
  );
}
