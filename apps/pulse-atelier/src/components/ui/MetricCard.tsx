import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  detail?: string;
  trend?: string;
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({
  label,
  value,
  detail,
  trend,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <article className={cn("rounded-lg border border-line bg-panel p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-steel">{label}</p>
          <div className="mt-3 text-3xl font-semibold tracking-normal text-frost">
            {value}
          </div>
        </div>
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pulse/25 bg-pulse/10 text-pulse">
            <Icon size={20} aria-hidden="true" />
          </div>
        ) : null}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        {trend ? <span className="font-semibold text-pulse">{trend}</span> : null}
        {detail ? <span className="text-steel">{detail}</span> : null}
      </div>
    </article>
  );
}
