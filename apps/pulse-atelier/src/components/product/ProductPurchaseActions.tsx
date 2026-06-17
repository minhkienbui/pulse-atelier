"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, Scale, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart-store";
import { useCompareStore } from "@/stores/compare-store";

interface ProductPurchaseActionsProps {
  productId: string;
  productName: string;
  stock: number;
}

export function ProductPurchaseActions({
  productId,
  productName,
  stock,
}: ProductPurchaseActionsProps) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((state) => state.add);
  const compareIds = useCompareStore((state) => state.productIds);
  const addToCompare = useCompareStore((state) => state.add);
  const isCompared = compareIds.includes(productId);
  const soldOut = stock <= 0;

  const addProduct = () => {
    if (soldOut) return;
    addToCart(productId);
    setAdded(true);
  };

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <Button
        leftIcon={<ShoppingBag size={17} />}
        disabled={soldOut}
        onClick={() => {
          addProduct();
          if (!soldOut) router.push("/thanh-toan");
        }}
      >
        Mua ngay
      </Button>
      <Button
        variant="secondary"
        leftIcon={<PackagePlus size={17} />}
        disabled={soldOut}
        onClick={addProduct}
      >
        {added ? "Da them vao gio" : "Them vao gio"}
      </Button>
      <Button
        className="sm:col-span-2"
        variant={isCompared ? "primary" : "secondary"}
        leftIcon={<Scale size={17} />}
        disabled={!isCompared && compareIds.length >= 4}
        aria-label={isCompared ? `${productName} da o Compare Lab` : `Them ${productName} vao Compare Lab`}
        onClick={() => {
          addToCompare(productId);
          router.push("/so-sanh");
        }}
      >
        {isCompared ? "Mo Compare Lab" : "Them vao so sanh"}
      </Button>
    </div>
  );
}
