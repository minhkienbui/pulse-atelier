"use client";

import Link from "next/link";
import { TicketPercent, Truck } from "lucide-react";
import type { OrderItem } from "@/types/domain";
import { calculateCartTotals } from "@/lib/checkout";
import { formatCurrency } from "@/lib/utils";

interface CartSummaryProps {
  orderItems: OrderItem[];
  couponCode: string;
  onCouponCodeChange: (value: string) => void;
  checkoutHref?: string;
  actionLabel?: string;
}

export function CartSummary({
  orderItems,
  couponCode,
  onCouponCodeChange,
  checkoutHref = "/thanh-toan",
  actionLabel = "Thanh toan",
}: CartSummaryProps) {
  const totals = calculateCartTotals(orderItems, couponCode);

  return (
    <aside className="rounded-lg border border-line bg-panel p-5">
      <div className="flex items-center gap-2">
        <TicketPercent size={18} className="text-pulse" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-frost">Tom tat don hang</h2>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-steel">Ma uu dai</span>
        <input
          value={couponCode}
          onChange={(event) => onCouponCodeChange(event.target.value)}
          placeholder="PULSE10"
          className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none placeholder:text-steel/70 focus:border-pulse"
        />
      </label>

      <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
        <div className="flex justify-between gap-4 text-steel">
          <span>Tam tinh</span>
          <span className="font-semibold text-frost">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4 text-steel">
          <span>Giam gia</span>
          <span className="font-semibold text-pulse">-{formatCurrency(totals.discount)}</span>
        </div>
        <div className="flex justify-between gap-4 text-steel">
          <span>Van chuyen</span>
          <span className="font-semibold text-frost">{formatCurrency(totals.shippingFee)}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-4 text-base font-semibold text-frost">
          <span>Tong cong</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-pulse/25 bg-pulse/10 p-3 text-sm leading-6 text-steel">
        <div className="mb-1 flex items-center gap-2 font-semibold text-pulse">
          <Truck size={16} aria-hidden="true" />
          Free shipping tu 20 trieu
        </div>
        Don hang duoi nguong se ap dung phi giao 45.000 VND.
      </div>

      <Link
        href={checkoutHref}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
      >
        {actionLabel}
      </Link>
    </aside>
  );
}
