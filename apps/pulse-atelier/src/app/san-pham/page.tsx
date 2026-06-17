import Link from "next/link";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { CatalogFilters } from "@/components/product/CatalogFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/data/products";
import { filterProducts, sortProducts, type CatalogSort } from "@/lib/catalog";
import type { Ecosystem, ProductCategory, UseCase } from "@/types/domain";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const validCategories: ProductCategory[] = ["watch", "earbuds", "band", "tablet", "accessory"];
const validEcosystems: Ecosystem[] = ["ios", "android", "windows", "cross-platform"];
const validUseCases: UseCase[] = ["work", "fitness", "travel", "study", "focus", "gaming", "everyday", "entertainment"];
const validSorts: CatalogSort[] = ["featured", "newest", "price-asc", "price-desc", "rating", "battery", "popular"];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q)?.trim();
  const category = first(params.category);
  const ecosystem = first(params.ecosystem);
  const useCase = first(params.useCase);
  const sort = first(params.sort);
  const values = {
    q,
    category: validCategories.includes(category as ProductCategory) ? (category as ProductCategory) : undefined,
    ecosystem: validEcosystems.includes(ecosystem as Ecosystem) ? (ecosystem as Ecosystem) : undefined,
    useCase: validUseCases.includes(useCase as UseCase) ? (useCase as UseCase) : undefined,
    sort: validSorts.includes(sort as CatalogSort) ? (sort as CatalogSort) : "featured",
  };
  const filteredProducts = sortProducts(
    filterProducts(products, {
      query: values.q,
      categoryIds: values.category ? [values.category] : undefined,
      ecosystems: values.ecosystem ? [values.ecosystem] : undefined,
      useCases: values.useCase ? [values.useCase] : undefined,
    }),
    values.sort,
  );

  return (
    <CustomerShell>
      <section className="shell py-12">
        <Badge variant="mint">Catalog</Badge>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-frost">San pham</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
              Loc theo danh muc, he sinh thai va nhip song de chon thiet bi dung voi ngay cua ban.
            </p>
          </div>
          <p className="text-sm font-semibold text-steel">{filteredProducts.length} ket qua</p>
        </div>
      </section>

      <section className="shell pb-12">
        <CatalogFilters values={values} />
        <div className="mt-6">
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <EmptyState
              title="Khong tim thay san pham phu hop"
              description="Thu bo bot bo loc hoac tim bang tu khoa ngan hon."
              action={
                <Link
                  href="/san-pham"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
                >
                  Xoa bo loc
                </Link>
              }
            />
          )}
        </div>
      </section>
    </CustomerShell>
  );
}
