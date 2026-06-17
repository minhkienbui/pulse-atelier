import Link from "next/link";
import { products } from "@/data/products";
import type { SupportTicket } from "@/types/domain";
import { Badge } from "@/components/ui/Badge";

interface SupportRequestsProps {
  tickets: SupportTicket[];
}

function ticketVariant(status: SupportTicket["status"]) {
  if (status === "resolved") return "mint";
  if (status === "in-progress") return "violet";
  return "warning";
}

export function SupportRequests({ tickets }: SupportRequestsProps) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-pulse">Support</p>
          <h2 className="mt-2 text-xl font-semibold text-frost">Bao hanh va ho tro</h2>
        </div>
        <Link href="/dang-nhap" className="text-sm font-semibold text-pulse hover:text-frost">
          Doi vai tro
        </Link>
      </div>
      <div className="mt-5 space-y-3">
        {tickets.map((ticket) => {
          const product = products.find((item) => item.id === ticket.productId);

          return (
            <article key={ticket.id} className="rounded-lg border border-line bg-graphite p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-frost">{ticket.subject}</h3>
                  <p className="mt-1 text-xs text-steel">
                    {product?.name ?? "Yeu cau tai khoan"} / {new Date(ticket.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <Badge variant={ticketVariant(ticket.status)}>{ticket.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-steel">
                Uu tien {ticket.priority}, phu trach boi {ticket.assignedTo}.
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
