import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  ChevronRight,
  Droplets,
  Gauge,
  Ruler,
  Shield,
  Star,
  Truck,
  Watch,
} from "lucide-react";
import { calculateDiscount, formatPrice } from "@/lib/utils";
import { getRelatedWatches, getWatchBySlug } from "@/data/catalog";
import ProductCard from "@/components/product/ProductCard";
import ProductPurchaseActions from "@/components/product/ProductPurchaseActions";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const watch = await getWatchBySlug(slug);

  if (!watch) {
    notFound();
  }

  const relatedWatches = await getRelatedWatches(
    watch.id,
    watch.brandId,
    watch.categoryId
  );
  const primaryImage = watch.images[0] || "/file.svg";
  const discount = watch.originalPrice
    ? calculateDiscount(watch.price, watch.originalPrice)
    : 0;
  const specs = [
    { icon: Gauge, label: "Bộ máy", value: watch.movement },
    { icon: Watch, label: "Chất liệu vỏ", value: watch.caseMaterial },
    { icon: null, label: "Màu mặt số", value: watch.dialColor },
    { icon: Droplets, label: "Chống nước", value: watch.waterResistance },
    { icon: Ruler, label: "Đường kính", value: watch.caseSize },
    { icon: null, label: "Dây đeo", value: watch.strapMaterial },
    { icon: Shield, label: "Bảo hành", value: watch.warranty ? `${watch.warranty} năm` : null },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4">
        <nav className="flex items-center gap-2 text-xs text-ivory/30">
          <Link href="/" className="hover:text-gold transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={12} />
          <Link href="/bo-suu-tap" className="hover:text-gold transition-colors">
            Bộ sưu tập
          </Link>
          <ChevronRight size={12} />
          <Link
            href={`/bo-suu-tap?brand=${watch.brand.slug}`}
            className="hover:text-gold transition-colors"
          >
            {watch.brand.name}
          </Link>
          <ChevronRight size={12} />
          <span className="text-ivory/50 truncate max-w-[220px]">
            {watch.name}
          </span>
        </nav>
      </div>

      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div>
            <div className="sticky top-28">
              <div className="relative aspect-square overflow-hidden bg-dark-surface border border-dark-border/30 mb-4">
                <Image
                  src={primaryImage}
                  alt={watch.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {watch.badge && (
                  <div className="absolute top-4 left-4">
                    <span className="badge-gold">{watch.badge}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="badge-gold badge-sale">-{discount}%</span>
                  </div>
                )}
              </div>
              {watch.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {watch.images.slice(0, 4).map((image, index) => (
                    <div
                      key={image}
                      className="relative aspect-square overflow-hidden border border-dark-border/30 bg-dark-card"
                    >
                      <Image
                        src={image}
                        alt={`${watch.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Link
              href={`/bo-suu-tap?brand=${watch.brand.slug}`}
              className="text-xs tracking-[0.3em] uppercase text-gold/70 font-medium hover:text-gold transition-colors"
            >
              {watch.brand.name}
            </Link>

            <h1 className="heading-serif text-3xl lg:text-5xl text-ivory leading-tight">
              {watch.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-ivory/40">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    className={
                      index < Math.round(watch.averageRating || 4)
                        ? "text-gold fill-gold"
                        : "text-dark-border"
                    }
                  />
                ))}
                <span className="ml-1">({watch.reviewCount} đánh giá)</span>
              </div>
              <span>SKU: {watch.sku}</span>
            </div>

            <div className="flex items-end gap-4 pb-4 border-b border-dark-border/20">
              <span className="text-3xl font-bold text-gold heading-serif">
                {formatPrice(watch.price)}
              </span>
              {watch.originalPrice && watch.originalPrice > watch.price && (
                <>
                  <span className="text-lg text-ivory/25 line-through">
                    {formatPrice(watch.originalPrice)}
                  </span>
                  <span className="badge-gold badge-sale text-sm">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {watch.description && (
              <p className="text-sm text-ivory/50 leading-7">
                {watch.description}
              </p>
            )}

            <ProductPurchaseActions watch={watch} />

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Shield, label: "Chính hãng 100%" },
                { icon: Truck, label: "Giao hàng bảo mật" },
                { icon: Award, label: `Bảo hành ${watch.warranty || 2} năm` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 p-3 glass-dark text-center"
                >
                  <item.icon size={18} className="text-gold/70" />
                  <span className="text-[10px] text-ivory/45 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <h2 className="text-sm font-semibold text-ivory/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Watch size={16} className="text-gold" />
                Thông số kỹ thuật
              </h2>
              <div className="overflow-hidden border border-dark-border/30">
                {specs.map((spec, index) => (
                  <div
                    key={spec.label}
                    className={`flex items-center justify-between px-4 py-3 text-sm ${
                      index % 2 === 0 ? "bg-dark-card/30" : "bg-dark-card/10"
                    } ${
                      index < specs.length - 1
                        ? "border-b border-dark-border/10"
                        : ""
                    }`}
                  >
                    <span className="text-ivory/40">{spec.label}</span>
                    <span className="text-ivory/80 font-medium text-right">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {relatedWatches.length > 0 && (
          <section className="mt-20 pt-16 border-t border-dark-border/20">
            <div className="mb-10">
              <p className="text-gold/60 text-xs tracking-[0.3em] uppercase font-medium mb-3">
                Có thể bạn quan tâm
              </p>
              <h2 className="heading-serif text-2xl sm:text-3xl text-ivory">
                Đồng hồ tương tự
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {relatedWatches.map((relatedWatch) => (
                <ProductCard key={relatedWatch.id} watch={relatedWatch} />
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
