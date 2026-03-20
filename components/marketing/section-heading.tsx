import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  badge,
  title,
  description
}: {
  badge: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <Badge>{badge}</Badge>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}
