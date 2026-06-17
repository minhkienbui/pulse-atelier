"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Scale, ShoppingBag, Star } from "lucide-react";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useCompareStore } from "@/stores/compare-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types/domain";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface ProductCardProps {
  product: Product;
}

function productMeta(product: Product) {
  const brand = brands.find((item) => item.id === product.brandId)?.name ?? "Pulse";
  const category = categories.find((item) => item.id === product.categoryId)?.name ?? product.categoryId;

  return { brand, category };
}

function stockCopy(product: Product) {
  if (product.stock <= 0) {
    return { label: "Het hang", variant: "danger" as const };
  }

  if (product.stock <= product.lowStockThreshold) {
    return { label: `Con ${product.stock}`, variant: "warning" as const };
  }

  return { label: "Con hang", variant: "mint" as const };
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.add);
  const wishlistIds = useWishlistStore((state) => state.productIds);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const compareIds = useCompareStore((state) => state.productIds);
  const addToCompare = useCompareStore((state) => state.add);
  const { brand, category } = productMeta(product);
  const stock = stockCopy(product);
  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = compareIds.includes(product.id);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-panel transition-colors hover:border-pulse/45">
      <Link
        href={`/san-pham/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-graphite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.badges.slice(0, 2).map((badge) => (
            <Badge key={badge} variant={badge === "Save" ? "violet" : "mint"}>
              {badge}
            </Badge>
          ))}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-steel">
              {brand} / {category}
            </p>
            <Link
              href={`/san-pham/${product.slug}`}
              className="mt-2 block text-lg font-semibold leading-snug text-frost hover:text-pulse focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
            >
              {product.name}
            </Link>
          </div>
          <Badge variant={stock.variant}>{stock.label}</Badge>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-steel">{product.shortDescription}</p>

        <div className="mt-4 flex items-center gap-2 text-sm text-steel">
          <Star size={16} className="fill-warning text-warning" aria-hidden="true" />
          <span className="font-semibold text-frost">{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-xl font-semibold text-frost">{formatCurrency(product.price)}</span>
          {product.originalPrice ? (
            <span className="text-sm text-steel line-through">{formatCurrency(product.originalPrice)}</span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button
            className="flex-1"
            disabled={product.stock <= 0}
            leftIcon={<ShoppingBag size={17} />}
            onClick={() => addToCart(product.id)}
          >
            Them vao gio
          </Button>
          <Button
            aria-label={isWishlisted ? "Bo yeu thich" : "Them yeu thich"}
            title={isWishlisted ? "Bo yeu thich" : "Them yeu thich"}
            size="icon"
            variant={isWishlisted ? "primary" : "secondary"}
            onClick={() => toggleWishlist(product.id)}
          >
            <Heart size={18} className={isWishlisted ? "fill-obsidian" : undefined} aria-hidden="true" />
          </Button>
          <Button
            aria-label={isCompared ? "Da them so sanh" : "Them vao so sanh"}
            title={isCompared ? "Da them so sanh" : "Them vao so sanh"}
            size="icon"
            variant={isCompared ? "primary" : "secondary"}
            disabled={!isCompared && compareIds.length >= 4}
            onClick={() => addToCompare(product.id)}
          >
            <Scale size={18} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
