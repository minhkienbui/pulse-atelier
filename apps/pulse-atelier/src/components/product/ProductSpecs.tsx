import {
  BatteryCharging,
  Bluetooth,
  CircleCheck,
  Droplets,
  Headphones,
  Radar,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type { Product } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ProductSpecsProps {
  product: Product;
  className?: string;
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Khong co thong tin";
}

export function ProductSpecs({ product, className }: ProductSpecsProps) {
  const specs = [
    {
      label: "Pin",
      value: product.batteryHours > 0 ? `${product.batteryHours} gio` : "Khong dung pin",
      icon: BatteryCharging,
    },
    {
      label: "He sinh thai",
      value: formatList(product.ecosystems),
      icon: Smartphone,
    },
    {
      label: "Ket noi",
      value: formatList(product.connectivity),
      icon: Bluetooth,
    },
    {
      label: "Khang nuoc",
      value: product.waterResistance ?? "Khong cong bo",
      icon: Droplets,
    },
    {
      label: "Cam bien",
      value: formatList(product.sensors),
      icon: Radar,
    },
    ...(product.anc
      ? [
          {
            label: "ANC",
            value: "Chong on chu dong",
            icon: Headphones,
          },
        ]
      : []),
    {
      label: "Bao hanh",
      value: `${product.warrantyMonths} thang`,
      icon: ShieldCheck,
    },
  ];

  return (
    <section className={cn("rounded-lg border border-line bg-panel p-5", className)}>
      <div className="mb-5 flex items-center gap-2">
        <CircleCheck size={18} className="text-pulse" aria-hidden="true" />
        <h2 className="text-base font-semibold text-frost">Thong so noi bat</h2>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {specs.map((spec) => {
          const Icon = spec.icon;

          return (
            <div key={spec.label} className="rounded-lg border border-line/70 bg-graphite px-3 py-3">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-steel">
                <Icon size={15} className="text-pulse" aria-hidden="true" />
                {spec.label}
              </dt>
              <dd className="mt-2 text-sm leading-6 text-frost">{spec.value}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
