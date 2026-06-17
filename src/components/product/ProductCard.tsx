"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { ProductCardDto } from "@/data/types";

interface ProductCardProps {
  watch: ProductCardDto;
  showDiscount?: boolean;
}

function getBadgeClass(badge: string): string {
  switch (badge) {
    case "Limited Edition":
      return "badge-gold badge-limited";
    case "New Arrival":
      return "badge-gold badge-new";
    case "Best Seller":
      return "badge-gold badge-bestseller";
    case "Sale":
      return "badge-gold badge-sale";
    default:
      return "badge-gold";
  }
}

export default function ProductCard({ watch, showDiscount }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(watch.id));
  const primaryImage = watch.images[0] || "/file.svg";

  const discount = watch.originalPrice
    ? calculateDiscount(watch.price, watch.originalPrice)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      watchId: watch.id,
      name: watch.name,
      slug: watch.slug,
      price: watch.price,
      originalPrice: watch.originalPrice,
      image: primaryImage,
      brand: watch.brand.name,
      stock: watch.stock,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      watchId: watch.id,
      name: watch.name,
      slug: watch.slug,
      price: watch.price,
      image: primaryImage,
      brand: watch.brand.name,
    });
  };

  return (
    <Link href={`/dong-ho/${watch.slug}`} className="block group">
      <div className="card-product">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-watch-dial">
          <Image
            src={primaryImage}
            alt={watch.name}
            fill
            className="object-contain p-6 product-image"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badge */}
          {watch.badge && (
            <div className="absolute top-3 left-3">
              <span className={getBadgeClass(watch.badge)}>
                {watch.badge}
              </span>
            </div>
          )}

          {/* Discount badge */}
          {showDiscount && discount > 0 && (
            <div className="absolute top-3 right-3">
              <span className="badge-gold badge-sale">
                -{discount}%
              </span>
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-3 sm:group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider bg-gold/90 hover:bg-gold text-dark-bg rounded-md transition-colors"
            >
              <ShoppingBag size={14} />
              Thêm vào giỏ
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`p-2.5 rounded-md transition-all ${
                isInWishlist
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-dark-card/80 backdrop-blur-sm text-ivory/60 hover:text-gold border border-dark-border/50"
              }`}
            >
              <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 border-t border-dark-border/25">
          {/* Brand */}
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 font-medium mb-1.5">
            {watch.brand.name}
          </p>

          {/* Name */}
          <h3 className="text-sm font-medium text-ivory/85 group-hover:text-ivory transition-colors line-clamp-2 leading-relaxed mb-3 min-h-[2.5rem]">
            {watch.name}
          </h3>

          {/* Specs */}
          {(watch.movement || watch.caseSize) && (
            <div className="flex items-center gap-3 mb-3 text-[10px] text-ivory/30">
              {watch.movement && <span>{watch.movement}</span>}
              {watch.movement && watch.caseSize && <span>•</span>}
              {watch.caseSize && <span>{watch.caseSize}</span>}
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-2">
            <span className="text-base font-bold text-gold">
              {formatPrice(watch.price)}
            </span>
            {watch.originalPrice && watch.originalPrice > watch.price && (
              <span className="text-xs text-ivory/30 line-through">
                {formatPrice(watch.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {watch.stock <= 3 && watch.stock > 0 && (
            <p className="mt-2 text-[10px] text-amber-500/70 font-medium">
              Chỉ còn {watch.stock} sản phẩm
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
