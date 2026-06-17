"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { AccountOverview } from "@/components/account/AccountOverview";
import { OrderHistory } from "@/components/account/OrderHistory";
import { SupportRequests } from "@/components/account/SupportRequests";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { supportTickets } from "@/data/admin";
import { customers } from "@/data/customers";
import { orders } from "@/data/orders";
import { products } from "@/data/products";
import { buildAccountSnapshot } from "@/lib/account";
import { mergeOrders } from "@/lib/orders";
import { useAuthStore } from "@/stores/auth-store";
import { useCompareStore } from "@/stores/compare-store";
import { useOrderStore } from "@/stores/order-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Customer } from "@/types/domain";

export default function AccountPage() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const customerId = user?.customerId ?? null;
  const createdOrders = useOrderStore((state) => state.orders);
  const mergedOrders = mergeOrders(orders, createdOrders);
  const wishlistIds = useWishlistStore((state) => state.productIds);
  const comparedIds = useCompareStore((state) => state.productIds);
  const registeredCustomer: Customer | null =
    user?.customerId && !customers.some((customer) => customer.id === user.customerId)
      ? {
          id: user.customerId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          segment: "New",
          address: user.address || "Chua cap nhat dia chi.",
          lifetimeSpend: 0,
          wishlistProductIds: [],
        }
      : null;
  const customerSource = registeredCustomer ? [registeredCustomer, ...customers] : customers;
  const snapshot = buildAccountSnapshot({
    customerId,
    customers: customerSource,
    orders: mergedOrders,
    products,
    tickets: supportTickets,
    wishlistProductIds: wishlistIds,
    comparedProductIds: comparedIds,
  });

  return (
    <CustomerShell>
      <section className="shell py-12">
        <Badge variant="mint">Account</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-frost">Tai khoan khach hang</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
          Khu vuc rieng cho profile, don hang, wishlist, thiet bi da mua va ticket ho tro.
        </p>
      </section>

      <section className="shell pb-12">
        {role === "guest" ? (
          <EmptyState
            icon={LockKeyhole}
            title="Can dang nhap"
            description="Dang nhap bang tai khoan nguoi dung de xem khu tai khoan rieng."
            action={
              <Link
                href="/dang-nhap"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
              >
                Dang nhap
              </Link>
            }
          />
        ) : role === "admin" ? (
          <EmptyState
            title="Ban dang o vai tro admin"
            description="Tai khoan nguoi dung co khu rieng, admin co khu quan tri rieng."
            action={
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
              >
                Mo admin
              </Link>
            }
          />
        ) : !snapshot.customer ? (
          <EmptyState
            icon={LockKeyhole}
            title="Chua co ho so khach hang"
            description="Tai khoan hien tai chua gan voi ho so khach hang nao."
            action={
              <Link
                href="/dang-nhap"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
              >
                Dang nhap lai
              </Link>
            }
          />
        ) : (
          <div className="space-y-8">
            <AccountOverview
              customer={snapshot.customer}
              orders={snapshot.orders}
              ownedDevices={snapshot.ownedDevices}
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <OrderHistory orders={snapshot.orders} />
              <SupportRequests tickets={snapshot.supportTickets} />
            </div>

            <section id="wishlist" className="scroll-mt-24">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <Badge variant="violet">Wishlist</Badge>
                  <h2 className="mt-3 text-2xl font-semibold text-frost">San pham yeu thich</h2>
                </div>
                <Link href="/san-pham" className="text-sm font-semibold text-pulse hover:text-frost">
                  Tim them
                </Link>
              </div>
              <ProductGrid products={snapshot.wishlistProducts} />
            </section>

            <section id="compared" className="scroll-mt-24">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <Badge variant="neutral">Compared</Badge>
                  <h2 className="mt-3 text-2xl font-semibold text-frost">San pham so sanh gan day</h2>
                </div>
                <Link href="/so-sanh" className="text-sm font-semibold text-pulse hover:text-frost">
                  Mo Compare Lab
                </Link>
              </div>
              {snapshot.comparedProducts.length > 0 ? (
                <ProductGrid products={snapshot.comparedProducts} />
              ) : (
                <p className="rounded-lg border border-line bg-panel p-5 text-sm text-steel">
                  Chua co san pham nao trong Compare Lab.
                </p>
              )}
            </section>
          </div>
        )}
      </section>
    </CustomerShell>
  );
}
