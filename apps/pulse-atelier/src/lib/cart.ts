import type { CartItem } from "@/stores/cart-store";
import type { Product } from "@/types/domain";

export interface CartLine {
  productId: string;
  quantity: number;
  product: Product;
  lineTotal: number;
}

export function resolveCartLines(_items: CartItem[], _products: Product[]): CartLine[] {
  return _items.flatMap((item) => {
    const product = _products.find((candidate) => candidate.id === item.productId);

    if (!product) {
      return [];
    }

    return [
      {
        productId: item.productId,
        quantity: item.quantity,
        product,
        lineTotal: product.price * item.quantity,
      },
    ];
  });
}

export function getSuggestedBundleProducts(
  items: CartItem[],
  products: Product[],
  limit = 3,
): Product[] {
  const cartIds = new Set(items.map((item) => item.productId));
  const suggestionIds = new Set<string>();

  for (const item of items) {
    const product = products.find((candidate) => candidate.id === item.productId);

    for (const bundleProductId of product?.bundleProductIds ?? []) {
      if (!cartIds.has(bundleProductId)) {
        suggestionIds.add(bundleProductId);
      }
    }
  }

  return [...suggestionIds]
    .map((id) => products.find((product) => product.id === id && product.status === "active"))
    .filter((product): product is Product => Boolean(product))
    .slice(0, limit);
}
