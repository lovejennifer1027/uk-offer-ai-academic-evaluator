import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ToolCard({
  title,
  description,
  status,
  href
}: {
  title: string;
  description: string;
  status: string;
  href: string;
}) {
  return (
    <Card className="h-full rounded-[32px] p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
        <Badge>{status}</Badge>
      </div>
      <div className="mt-5 h-px bg-[linear-gradient(90deg,rgba(59,76,107,0.08),transparent)]" />
      <p className="mt-5 text-sm leading-7 text-slate-600">{description}</p>
      <Link href={href} className="mt-6 inline-block">
        <Button variant="secondary">Open</Button>
      </Link>
    </Card>
  );
}
