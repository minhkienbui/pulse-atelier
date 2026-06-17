import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function AdminPageHeader({ eyebrow, title, description, action }: AdminPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase text-pulse">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-frost">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">{description}</p>
      </div>
      {action}
    </header>
  );
}
