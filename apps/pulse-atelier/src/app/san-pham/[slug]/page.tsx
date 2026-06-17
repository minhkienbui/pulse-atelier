import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPurchaseActions } from "@/components/product/ProductPurchaseActions";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/data/products";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products
    .filter((product) => product.status === "active")
    .map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <CustomerShell>
        <section className="shell py-12">
          <EmptyState
            title="Khong tim thay san pham"
            description="San pham co the da ngung ban hoac duong dan khong chinh xac."
            action={
              <Link
                href="/san-pham"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
              >
                Quay lai catalog
              </Link>
            }
          />
        </section>
      </CustomerShell>
    );
  }

  const brand = brands.find((item) => item.id === product.brandId);
  const category = categories.find((item) => item.id === product.categoryId);
  const relatedProducts = getRelatedProducts(product);
  const bundleProducts = products.filter((item) => product.bundleProductIds.includes(item.id));
  const stockLabel = product.stock <= product.lowStockThreshold ? `Con ${product.stock}` : "Con hang";

  return (
    <CustomerShell>
      <section className="shell py-8">
        <Link href="/san-pham" className="inline-flex items-center gap-2 text-sm font-semibold text-steel hover:text-pulse">
          <ArrowLeft size={16} aria-hidden="true" />
          Quay lai catalog
        </Link>
      </section>

      <section className="shell grid gap-8 pb-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="grid gap-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-graphite">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[product.image, ...product.gallery].slice(0, 4).map((image, index) => (
              <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-graphite">
                <Image src={image} alt={`${product.name} ${index + 1}`} fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-line bg-panel p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <Badge key={badge} variant={badge === "Save" ? "violet" : "mint"}>
                {badge}
              </Badge>
            ))}
            <Badge variant={product.stock <= product.lowStockThreshold ? "warning" : "mint"}>{stockLabel}</Badge>
          </div>
          <p className="mt-5 text-sm font-semibold uppercase text-pulse">
            {brand?.name ?? "Pulse"} / {category?.name ?? product.categoryId}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-frost text-balance">{product.name}</h1>
          <p className="mt-4 text-sm leading-6 text-steel">{product.description}</p>

          <div className="mt-5 flex items-center gap-2 text-sm text-steel">
            <Star size={17} className="fill-warning text-warning" aria-hidden="true" />
            <span className="font-semibold text-frost">{product.rating.toFixed(1)}</span>
            <span>{product.reviewCount} danh gia</span>
            <span>/</span>
            <span>{product.soldCount} da ban</span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold text-frost">{formatCurrency(product.price)}</span>
            {product.originalPrice ? (
              <span className="text-sm text-steel line-through">{formatCurrency(product.originalPrice)}</span>
            ) : null}
          </div>

          <ProductPurchaseActions productId={product.id} productName={product.name} stock={product.stock} />

          <div className="mt-6 rounded-lg border border-line bg-graphite p-4">
            <h2 className="text-sm font-semibold text-frost">Ghi chu tuong thich</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-steel">
              {product.compatibilityNotes.map((note) => (
                <li key={note}>- {note}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="shell grid gap-6 py-8 lg:grid-cols-[1fr_0.8fr]">
        <ProductSpecs product={product} />
        <section className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-base font-semibold text-frost">Tong quan danh gia</h2>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-5xl font-semibold text-frost">{product.rating.toFixed(1)}</span>
            <span className="pb-2 text-sm text-steel">/ 5 tu {product.reviewCount} danh gia</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-steel">
            Khach hang danh gia cao ve do on dinh, pin va su phu hop voi cac nhu cau {product.useCases.join(", ")}.
          </p>
        </section>
      </section>

      {bundleProducts.length > 0 ? (
        <section className="shell py-8">
          <div className="mb-5">
            <Badge variant="violet">Bundle</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-frost">Phu kien goi y di kem</h2>
          </div>
          <ProductGrid products={bundleProducts} />
        </section>
      ) : null}

      <section className="shell py-12">
        <div className="mb-5">
          <Badge variant="neutral">Related</Badge>
          <h2 className="mt-3 text-2xl font-semibold text-frost">San pham lien quan</h2>
        </div>
        <ProductGrid products={relatedProducts} />
      </section>
    </CustomerShell>
  );
}
