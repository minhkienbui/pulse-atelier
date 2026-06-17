import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export interface AdminColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  title?: string;
  description?: string;
  rows: T[];
  columns: AdminColumn<T>[];
  getRowKey: (row: T) => string;
  emptyText?: string;
}

export function AdminDataTable<T>({
  title,
  description,
  rows,
  columns,
  getRowKey,
  emptyText = "Khong co du lieu.",
}: AdminDataTableProps<T>) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-panel">
      {title || description ? (
        <div className="border-b border-line px-4 py-4">
          {title ? <h2 className="text-lg font-semibold text-frost">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm text-steel">{description}</p> : null}
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse text-left text-sm">
            <thead className="bg-graphite text-xs uppercase text-steel">
              <tr>
                {columns.map((column) => (
                  <th key={column.header} className={cn("px-4 py-3 font-semibold", column.className)}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={getRowKey(row)} className="border-t border-line/70">
                  {columns.map((column) => (
                    <td key={column.header} className={cn("px-4 py-4 align-top text-steel", column.className)}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4">
          <EmptyState title={emptyText} className="min-h-48" />
        </div>
      )}
    </section>
  );
}
