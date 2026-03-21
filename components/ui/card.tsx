import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "card-surface rounded-[32px] p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
