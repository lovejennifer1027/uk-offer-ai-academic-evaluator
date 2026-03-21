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
      <div className="eyebrow-pill">
        <Badge>{badge}</Badge>
      </div>
      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950 md:text-[2.65rem] md:leading-[1.08]">{title}</h2>
      {description ? <p className="mt-5 text-base leading-8 text-slate-600 md:text-[1.05rem]">{description}</p> : null}
    </div>
  );
}
