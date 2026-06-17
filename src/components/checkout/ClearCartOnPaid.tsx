"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

export default function ClearCartOnPaid() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
