import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = CircleDashed,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-panel/55 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-pulse/25 bg-pulse/10 text-pulse">
        <Icon size={22} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-frost">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-steel">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
