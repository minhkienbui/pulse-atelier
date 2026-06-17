"use client";

import { useMemo, useState } from "react";
import { Headphones, Scale, ShoppingBag, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { recommendProductsForRhythm } from "@/lib/finder";
import { useCartStore } from "@/stores/cart-store";
import { useCompareStore } from "@/stores/compare-store";
import type { UseCase } from "@/types/domain";

const rhythmOptions: { value: UseCase; label: string; copy: string }[] = [
  { value: "work", label: "Lam viec", copy: "Lich hop, thong bao va pin ca ngay." },
  { value: "fitness", label: "Tap luyen", copy: "Du lieu suc khoe, GPS va khang nuoc." },
  { value: "travel", label: "Di chuyen", copy: "Pin lau, gon nhe va ket noi on dinh." },
  { value: "focus", label: "Tap trung", copy: "Giam nhieu va giu nhip lam viec sau." },
  { value: "study", label: "Hoc tap", copy: "Doc, ghi chu va hoc truc tuyen linh hoat." },
  { value: "entertainment", label: "Giai tri", copy: "Man hinh, am thanh va thoi gian thu gian." },
];

export function RhythmFinder() {
  const [selectedRhythm, setSelectedRhythm] = useState<UseCase>("work");
  const addToCart = useCartStore((state) => state.add);
  const compareIds = useCompareStore((state) => state.productIds);
  const addToCompare = useCompareStore((state) => state.add);
  const recommendations = useMemo(
    () => recommendProductsForRhythm(selectedRhythm),
    [selectedRhythm],
  );

  return (
    <section
      id="rhythm-finder"
      className="shell grid gap-6 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start"
    >
      <div className="rounded-lg border border-line bg-panel p-5 sm:p-6">
        <Badge variant="mint">Rhythm Finder</Badge>
        <h2 className="mt-5 text-3xl font-semibold leading-tight text-frost text-balance">
          Chon nhip song, nhan goi y thiet bi hop ngay.
        </h2>
        <p className="mt-3 text-sm leading-6 text-steel">
          Moi lua chon duoc cham theo nhu cau that: pin, cam bien, he sinh thai
          va kha nang dung chung voi phu kien.
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {rhythmOptions.map((option) => {
            const active = option.value === selectedRhythm;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedRhythm(option.value)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  active
                    ? "border-pulse bg-pulse/12 text-frost"
                    : "border-line bg-graphite text-steel hover:border-pulse/45 hover:text-frost"
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-1 block text-xs leading-5">{option.copy}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map(({ product, reason }) => {
          const isCompared = compareIds.includes(product.id);

          return (
            <article
              key={product.id}
              className="rounded-lg border border-line bg-panel p-4"
            >
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-pulse">
                <Sparkles size={15} aria-hidden="true" />
                Ly do phu hop
              </div>
              <p className="mb-4 text-sm leading-6 text-steel">{reason}</p>
              <ProductCard product={product} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  leftIcon={<ShoppingBag size={16} />}
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock <= 0}
                >
                  Them
                </Button>
                <Button
                  size="sm"
                  variant={isCompared ? "primary" : "secondary"}
                  leftIcon={isCompared ? <Headphones size={16} /> : <Scale size={16} />}
                  disabled={!isCompared && compareIds.length >= 4}
                  onClick={() => addToCompare(product.id)}
                >
                  {isCompared ? "Da chon" : "So sanh"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
