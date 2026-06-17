import { Badge, type BadgeVariant } from "@/components/ui/Badge";

const statusVariants: Record<string, BadgeVariant> = {
  active: "mint",
  draft: "neutral",
  pending: "warning",
  confirmed: "violet",
  packed: "violet",
  shipping: "violet",
  completed: "mint",
  cancelled: "danger",
  paid: "mint",
  failed: "danger",
  published: "mint",
  hidden: "danger",
  open: "warning",
  "in-progress": "violet",
  resolved: "mint",
};

export function AdminStatusPill({ status }: { status: string }) {
  return <Badge variant={statusVariants[status] ?? "neutral"}>{status}</Badge>;
}
