import Image from "next/image";
import Link from "next/link";
import { MapPin, PackageCheck, ReceiptText, ShieldCheck } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import type { Customer, Order, Product } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";

interface AccountOverviewProps {
  customer: Customer;
  orders: Order[];
  ownedDevices: Product[];
}

export function AccountOverview({ customer, orders, ownedDevices }: AccountOverviewProps) {
  const activeOrders = orders.filter((order) => order.status !== "completed" && order.status !== "cancelled").length;

  return (
    <section className="grid gap-6 lg:grid-cols-[0.72fr_1fr]">
      <article className="rounded-lg border border-line bg-panel p-5">
        <p className="text-xs font-semibold uppercase text-pulse">Customer profile</p>
        <h2 className="mt-3 text-3xl font-semibold text-frost">{customer.name}</h2>
        <p className="mt-2 text-sm text-steel">{customer.email}</p>
        <p className="mt-1 text-sm text-steel">{customer.phone}</p>
        <div className="mt-5 rounded-lg border border-line bg-graphite p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-frost">
            <MapPin size={17} className="text-pulse" aria-hidden="true" />
            Dia chi da luu
          </div>
          <p className="mt-2 text-sm leading-6 text-steel">{customer.address}</p>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Hang thanh vien"
          value={customer.segment}
          detail="Trang thai thanh vien"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Chi tieu tich luy"
          value={formatCurrency(customer.lifetimeSpend)}
          detail={`${orders.length} don hang`}
          icon={ReceiptText}
        />
        <MetricCard
          label="Don dang xu ly"
          value={activeOrders}
          detail="Can theo doi"
          icon={PackageCheck}
        />
      </div>

      <article className="rounded-lg border border-line bg-panel p-5 lg:col-span-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-pulse">Owned devices</p>
            <h2 className="mt-2 text-xl font-semibold text-frost">Thiet bi dang so huu</h2>
          </div>
          <Link href="/san-pham" className="text-sm font-semibold text-pulse hover:text-frost">
            Them thiet bi
          </Link>
        </div>
        {ownedDevices.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ownedDevices.map((product) => (
              <Link
                key={product.id}
                href={`/san-pham/${product.slug}`}
                className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border border-line bg-graphite p-3 transition-colors hover:border-pulse/50"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-panel">
                  <Image src={product.image} alt={product.name} fill sizes="72px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-frost">{product.name}</h3>
                  <p className="mt-1 text-xs text-steel">{product.warrantyMonths} thang bao hanh</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-steel">Chua co thiet bi hoan tat trong lich su don hang.</p>
        )}
      </article>
    </section>
  );
}
