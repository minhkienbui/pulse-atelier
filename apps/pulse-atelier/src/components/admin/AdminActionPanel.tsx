import type { ReactNode } from "react";

interface AdminActionPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AdminActionPanel({ title, description, children }: AdminActionPanelProps) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <h2 className="text-lg font-semibold text-frost">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-steel">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
