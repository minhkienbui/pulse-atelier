"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { ProductDetailDto } from "@/data/types";

export default function ProductPurchaseActions({
  watch,
}: {
  watch: ProductDetailDto;
}) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(watch.id));
  const primaryImage = watch.images[0] || "/file.svg";

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i += 1) {
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center border border-dark-border rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 text-ivory/40 hover:text-gold transition-colors"
            aria-label="Giảm số lượng"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center text-sm font-medium text-ivory">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(watch.stock, quantity + 1))}
            className="p-3 text-ivory/40 hover:text-gold transition-colors"
            aria-label="Tăng số lượng"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="btn-gold flex-1 py-4 text-sm"
          disabled={watch.stock === 0}
        >
          <ShoppingBag size={18} />
          {watch.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
        </button>

        <button
          type="button"
          onClick={() =>
            toggleWishlist({
              watchId: watch.id,
              name: watch.name,
              slug: watch.slug,
              price: watch.price,
              image: primaryImage,
              brand: watch.brand.name,
            })
          }
          className={`p-4 rounded-lg border transition-all ${
            isInWishlist
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "border-dark-border text-ivory/40 hover:border-gold/30 hover:text-gold"
          }`}
          aria-label="Thêm vào danh sách yêu thích"
        >
          <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      {watch.stock > 0 && watch.stock <= 5 && (
        <div className="flex items-center gap-2 text-xs text-amber-500/70">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Chỉ còn {watch.stock} sản phẩm trong kho
        </div>
      )}
    </div>
  );
}
