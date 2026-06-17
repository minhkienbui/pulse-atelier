"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/data/products";
import { getSuggestedBundleProducts, resolveCartLines } from "@/lib/cart";
import { useCartStore } from "@/stores/cart-store";
import { useState } from "react";

export default function CartPage() {
  const [couponCode, setCouponCode] = useState("PULSE10");
  const cartItems = useCartStore((state) => state.items);
  const lines = resolveCartLines(cartItems, products);
  const suggestions = getSuggestedBundleProducts(cartItems, products, 3);
  const orderItems = lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    unitPrice: line.product.price,
  }));

  return (
    <CustomerShell>
      <section className="shell py-12">
        <Badge variant="mint">Cart</Badge>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-frost">Gio hang</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
              Kiem tra so luong, ap dung ma PULSE10 va them phu kien goi y truoc khi thanh toan.
            </p>
          </div>
          <p className="text-sm font-semibold text-steel">{lines.length} dong san pham</p>
        </div>
      </section>

      <section className="shell pb-12">
        {lines.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="space-y-4">
              {lines.map((line) => (
                <CartLineItem key={line.productId} line={line} />
              ))}
            </div>
            <CartSummary
              orderItems={orderItems}
              couponCode={couponCode}
              onCouponCodeChange={setCouponCode}
            />
          </div>
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="Gio hang dang trong"
            description="Them dong ho, tai nghe, tablet hoac phu kien thong minh de bat dau don hang."
            action={
              <Link
                href="/san-pham"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
              >
                Mo catalog
              </Link>
            }
          />
        )}
      </section>

      {suggestions.length > 0 ? (
        <section className="shell pb-12">
          <div className="mb-5">
            <Badge variant="violet">Bundle add-ons</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-frost">Phu kien nen them vao goi</h2>
          </div>
          <ProductGrid products={suggestions} />
        </section>
      ) : null}
    </CustomerShell>
  );
}
