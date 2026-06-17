"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CartLine } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

interface CartLineItemProps {
  line: CartLine;
}

export function CartLineItem({ line }: CartLineItemProps) {
  const remove = useCartStore((state) => state.remove);
  const setQuantity = useCartStore((state) => state.setQuantity);

  return (
    <article className="grid gap-4 rounded-lg border border-line bg-panel p-4 sm:grid-cols-[112px_1fr_auto]">
      <Link
        href={`/san-pham/${line.product.slug}`}
        className="relative aspect-square overflow-hidden rounded-lg bg-graphite"
      >
        <Image
          src={line.product.image}
          alt={line.product.name}
          fill
          sizes="112px"
          className="object-cover"
        />
      </Link>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-pulse">{line.product.sku}</p>
        <Link
          href={`/san-pham/${line.product.slug}`}
          className="mt-2 block text-lg font-semibold text-frost hover:text-pulse"
        >
          {line.product.name}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-steel">
          {line.product.shortDescription}
        </p>
        <p className="mt-3 text-sm font-semibold text-frost">
          {formatCurrency(line.product.price)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <div className="grid h-11 grid-cols-[40px_48px_40px] overflow-hidden rounded-lg border border-line bg-graphite">
          <button
            type="button"
            aria-label={`Giam so luong ${line.product.name}`}
            className="flex items-center justify-center text-steel hover:bg-panel-soft hover:text-frost disabled:opacity-40"
            disabled={line.quantity <= 1}
            onClick={() => setQuantity(line.productId, line.quantity - 1)}
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <span className="flex items-center justify-center border-x border-line text-sm font-semibold text-frost">
            {line.quantity}
          </span>
          <button
            type="button"
            aria-label={`Tang so luong ${line.product.name}`}
            className="flex items-center justify-center text-steel hover:bg-panel-soft hover:text-frost disabled:opacity-40"
            disabled={line.quantity >= 9}
            onClick={() => setQuantity(line.productId, line.quantity + 1)}
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <p className="text-right text-base font-semibold text-frost">{formatCurrency(line.lineTotal)}</p>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Xoa ${line.product.name} khoi gio hang`}
            title="Xoa khoi gio hang"
            onClick={() => remove(line.productId)}
          >
            <Trash2 size={17} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
