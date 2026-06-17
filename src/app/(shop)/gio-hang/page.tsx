"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Tag,
  Shield,
  ChevronRight,
  Package,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = () => {
    if (couponCode.trim() === "TEMPUS10") {
      setDiscount(getTotal() * 0.1);
      toast.success("Áp dụng mã giảm giá 10% thành công!");
    } else if (couponCode.trim()) {
      toast.error("Mã giảm giá không hợp lệ");
    }
  };

  const subtotal = getTotal();
  const shippingFee = subtotal >= 50000000 ? 0 : 500000;
  const total = subtotal - discount + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-card border border-dark-border/30 flex items-center justify-center">
            <ShoppingBag size={32} className="text-ivory/20" />
          </div>
          <h2 className="heading-serif text-2xl text-ivory mb-3">Giỏ Hàng Trống</h2>
          <p className="text-sm text-ivory/40 mb-6">
            Chưa có sản phẩm nào trong giỏ hàng của bạn
          </p>
          <Link href="/bo-suu-tap" className="btn-gold text-sm">
            Khám Phá Bộ Sưu Tập
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4">
        <nav className="flex items-center gap-2 text-xs text-ivory/30">
          <Link href="/" className="hover:text-gold transition-colors">Trang chủ</Link>
          <ChevronRight size={12} />
          <span className="text-ivory/50">Giỏ hàng</span>
        </nav>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="heading-serif text-3xl sm:text-4xl text-ivory">Giỏ Hàng</h1>
          <p className="text-sm text-ivory/40 mt-2">{items.length} sản phẩm</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.watchId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex gap-4 sm:gap-6 p-4 rounded-xl bg-dark-card border border-dark-border/30 hover:border-dark-border/50 transition-colors"
                >
                  {/* Image */}
                  <Link href={`/dong-ho/${item.slug}`} className="shrink-0">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-dark-surface">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold/50 font-medium mb-1">
                      {item.brand}
                    </p>
                    <Link
                      href={`/dong-ho/${item.slug}`}
                      className="text-sm font-medium text-ivory/85 hover:text-gold transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-dark-border/50 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.watchId, item.quantity - 1)}
                          className="p-2 text-ivory/30 hover:text-gold transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-ivory">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.watchId, item.quantity + 1)}
                          className="p-2 text-ivory/30 hover:text-gold transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-gold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-ivory/30">
                            {formatPrice(item.price)} / chiếc
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.watchId)}
                    className="self-start p-2 text-ivory/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Clear Cart */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-xs text-ivory/30 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} />
                Xóa giỏ hàng
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 rounded-xl glass-dark border border-dark-border/30">
              <h3 className="text-sm font-semibold text-ivory/80 uppercase tracking-wider mb-6">
                Tóm Tắt Đơn Hàng
              </h3>

              {/* Coupon */}
              <div className="mb-6">
                <label className="text-xs text-ivory/40 mb-2 block">Mã giảm giá</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20" />
                    <input
                      type="text"
                      placeholder="Nhập mã..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-dark-bg/50 border border-dark-border/50 rounded-lg text-ivory placeholder:text-ivory/20"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold border border-gold/30 rounded-lg hover:bg-gold/10 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3 pb-4 border-b border-dark-border/20">
                <div className="flex justify-between text-sm">
                  <span className="text-ivory/40">Tạm tính</span>
                  <span className="text-ivory/70">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-500/70">Giảm giá</span>
                    <span className="text-green-500">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-ivory/40">Phí vận chuyển</span>
                  <span className={shippingFee === 0 ? "text-green-500" : "text-ivory/70"}>
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-end pt-4 mb-6">
                <span className="text-sm font-medium text-ivory/60">Tổng cộng</span>
                <span className="text-2xl font-bold text-gold heading-serif">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link href="/thanh-toan" className="btn-gold w-full py-4 text-sm">
                Tiến Hành Thanh Toán
                <ArrowRight size={16} />
              </Link>

              {/* Trust */}
              <div className="mt-6 space-y-2">
                {[
                  { icon: Shield, text: "Sản phẩm chính hãng 100%" },
                  { icon: Package, text: "Đóng gói cao cấp & bảo hiểm" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-[11px] text-ivory/30">
                    <item.icon size={12} className="text-gold/40" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
