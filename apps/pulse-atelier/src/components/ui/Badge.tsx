import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "mint" | "violet" | "neutral" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  mint: "border-pulse/40 bg-pulse/12 text-pulse",
  violet: "border-signal/45 bg-signal/14 text-[#B8BFFF]",
  neutral: "border-steel/20 bg-panel-soft text-steel",
  warning: "border-warning/40 bg-warning/14 text-warning",
  danger: "border-danger/40 bg-danger/14 text-danger",
};

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold leading-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
