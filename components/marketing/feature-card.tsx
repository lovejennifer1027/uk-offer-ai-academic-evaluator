import type { ComponentType } from "react";
import * as Icons from "lucide-react";

import { Card } from "@/components/ui/card";

export function FeatureCard({
  icon,
  title,
  description
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const Icon = (Icons as Record<string, ComponentType<{ className?: string }>>)[icon] ?? Icons.Sparkles;

  return (
    <Card className="h-full rounded-[30px]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </Card>
  );
}
