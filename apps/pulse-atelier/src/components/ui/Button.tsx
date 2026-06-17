import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-pulse/70 bg-pulse text-obsidian shadow-[0_0_28px_rgba(136,240,208,0.18)] hover:bg-[#9af6dc]",
  secondary:
    "border-line bg-panel-soft text-frost hover:border-pulse/50 hover:bg-panel",
  ghost:
    "border-transparent bg-transparent text-steel hover:bg-panel-soft hover:text-frost",
  danger:
    "border-danger/70 bg-danger text-obsidian hover:bg-[#ff94a1]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  icon: "h-10 w-10 p-0",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-semibold transition-colors disabled:pointer-events-none disabled:opacity-45",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    >
      {leftIcon ? <span className="flex" aria-hidden="true">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span className="flex" aria-hidden="true">{rightIcon}</span> : null}
    </button>
  );
}
