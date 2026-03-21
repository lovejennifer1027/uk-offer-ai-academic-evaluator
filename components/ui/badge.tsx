import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[rgba(107,116,214,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,249,255,0.86))] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.02em] text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
