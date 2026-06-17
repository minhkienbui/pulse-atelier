"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { products } from "@/data/products";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useCompareStore } from "@/stores/compare-store";

function list(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Khong co";
}

export function CompareTable() {
  const productIds = useCompareStore((state) => state.productIds);
  const remove = useCompareStore((state) => state.remove);
  const selectedProducts = productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .slice(0, 4);

  if (selectedProducts.length < 2) {
    return (
      <EmptyState
        title="Can it nhat 2 san pham de so sanh"
        description="Them san pham tu catalog hoac Rhythm Finder, sau do quay lai Compare Lab."
        action={
          <Link
            href="/san-pham"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
          >
            Mo catalog
          </Link>
        }
      />
    );
  }

  const rows = [
    { label: "Gia", value: (id: string) => formatCurrency(products.find((product) => product.id === id)?.price ?? 0) },
    { label: "Pin", value: (id: string) => {
      const product = products.find((item) => item.id === id);
      return product && product.batteryHours > 0 ? `${product.batteryHours} gio` : "Khong dung pin";
    } },
    { label: "He sinh thai", value: (id: string) => list(products.find((item) => item.id === id)?.ecosystems ?? []) },
    { label: "Ket noi", value: (id: string) => list(products.find((item) => item.id === id)?.connectivity ?? []) },
    { label: "Cam bien", value: (id: string) => list(products.find((item) => item.id === id)?.sensors ?? []) },
    { label: "ANC", value: (id: string) => (products.find((item) => item.id === id)?.anc ? "Co" : "Khong") },
    { label: "Khoi luong", value: (id: string) => {
      const weight = products.find((item) => item.id === id)?.weightGrams;
      return weight ? `${weight}g` : "Khong cong bo";
    } },
    { label: "Bao hanh", value: (id: string) => `${products.find((item) => item.id === id)?.warrantyMonths ?? 0} thang` },
    { label: "Nhu cau", value: (id: string) => list(products.find((item) => item.id === id)?.useCases ?? []) },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-graphite">
              <th className="w-40 px-4 py-4 text-xs font-semibold uppercase text-steel">
                Tieu chi
              </th>
              {selectedProducts.map((product) => (
                <th key={product.id} className="px-4 py-4 align-top">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/san-pham/${product.slug}`}
                      className="text-sm font-semibold text-frost hover:text-pulse"
                    >
                      {product.name}
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Bo ${product.name} khoi so sanh`}
                      title="Bo khoi so sanh"
                      onClick={() => remove(product.id)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-line/70 last:border-b-0">
                <th className="bg-graphite/45 px-4 py-4 text-sm font-semibold text-steel">
                  {row.label}
                </th>
                {selectedProducts.map((product) => (
                  <td key={product.id} className="px-4 py-4 text-sm leading-6 text-frost">
                    {row.value(product.id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
