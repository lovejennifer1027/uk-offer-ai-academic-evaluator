import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_46px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400",
  ghost:
    "inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/80 hover:text-slate-900"
};

export function Button({ className, variant = "primary", children, ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button className={cn(variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
