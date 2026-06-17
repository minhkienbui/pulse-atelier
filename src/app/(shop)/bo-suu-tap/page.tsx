import Link from "next/link";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { getCatalogPageData } from "@/data/catalog";

type SearchParams = Record<string, string | string[] | undefined>;

const PRICE_RANGES = [
  { label: "Dưới 100 triệu", minPrice: "0", maxPrice: "100000000" },
  { label: "100 - 300 triệu", minPrice: "100000000", maxPrice: "300000000" },
  { label: "300 - 500 triệu", minPrice: "300000000", maxPrice: "500000000" },
  { label: "500 triệu - 1 tỷ", minPrice: "500000000", maxPrice: "1000000000" },
  { label: "Trên 1 tỷ", minPrice: "1000000000", maxPrice: undefined },
];

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Giá thấp đến cao", value: "price-asc" },
  { label: "Giá cao đến thấp", value: "price-desc" },
  { label: "Bán chạy nhất", value: "bestseller" },
  { label: "Tên A-Z", value: "name-asc" },
];

function firstParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(params: SearchParams, updates: Record<string, string | undefined>) {
  const nextParams = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(params)) {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (value) nextParams.set(key, value);
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
  }

  const query = nextParams.toString();
  return query ? `/bo-suu-tap?${query}` : "/bo-suu-tap";
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const data = await getCatalogPageData(params);
  const selectedBrand = firstParam(params, "brand");
  const selectedCategory = firstParam(params, "category");
  const selectedMovement = firstParam(params, "movement");
  const selectedSort = firstParam(params, "sort") || "newest";
  const selectedMin = firstParam(params, "minPrice");
  const selectedMax = firstParam(params, "maxPrice");
  const query = firstParam(params, "q") || "";
  const hasActiveFilters =
    Boolean(selectedBrand) ||
    Boolean(selectedCategory) ||
    Boolean(selectedMovement) ||
    Boolean(selectedMin) ||
    Boolean(selectedMax) ||
    Boolean(query);

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 bg-dark-surface/30 border-b border-dark-border/20">
        <div className="absolute inset-0 hero-gradient opacity-45" />
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6">
          <p className="text-gold/60 text-xs tracking-[0.3em] uppercase font-medium mb-3">
            Bộ sưu tập
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="heading-serif text-4xl sm:text-5xl text-ivory mb-4">
                Đồng hồ cao cấp
              </h1>
              <p className="text-ivory/42 max-w-2xl text-sm leading-6">
                Duyệt các mẫu đang có sẵn, được lọc trực tiếp từ dữ liệu sản
                phẩm đang hoạt động trong hệ thống Tempus.
              </p>
            </div>
            <form action="/bo-suu-tap" className="relative w-full lg:w-96">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30"
              />
              <input
                name="q"
                defaultValue={query}
                placeholder="Tìm theo tên, SKU, thương hiệu..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-dark-card border border-dark-border rounded-lg text-ivory placeholder:text-ivory/25 focus:border-gold/40"
              />
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-28 space-y-5 border border-dark-border/30 bg-dark-card/30 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ivory/80 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-gold" />
                  Bộ lọc
                </h2>
                {hasActiveFilters && (
                  <Link
                    href="/bo-suu-tap"
                    className="text-xs text-gold/70 hover:text-gold flex items-center gap-1"
                  >
                    <X size={13} />
                    Xóa
                  </Link>
                )}
              </div>

              <FilterGroup title="Thương hiệu">
                {data.brands.map((brand) => (
                  <FilterLink
                    key={brand.id}
                    href={buildHref(params, {
                      brand: selectedBrand === brand.slug ? undefined : brand.slug,
                    })}
                    active={selectedBrand === brand.slug}
                  >
                    {brand.name}
                  </FilterLink>
                ))}
              </FilterGroup>

              <FilterGroup title="Danh mục">
                {data.categories.map((category) => (
                  <FilterLink
                    key={category.id}
                    href={buildHref(params, {
                      category:
                        selectedCategory === category.slug
                          ? undefined
                          : category.slug,
                    })}
                    active={selectedCategory === category.slug}
                  >
                    {category.name}
                  </FilterLink>
                ))}
              </FilterGroup>

              <FilterGroup title="Bộ máy">
                {data.movements.map((movement) => (
                  <FilterLink
                    key={movement}
                    href={buildHref(params, {
                      movement:
                        selectedMovement === movement ? undefined : movement,
                    })}
                    active={selectedMovement === movement}
                  >
                    {movement}
                  </FilterLink>
                ))}
              </FilterGroup>

              <FilterGroup title="Mức giá">
                {PRICE_RANGES.map((range) => {
                  const active =
                    selectedMin === range.minPrice &&
                    (selectedMax || undefined) === range.maxPrice;

                  return (
                    <FilterLink
                      key={range.label}
                      href={buildHref(params, {
                        minPrice: active ? undefined : range.minPrice,
                        maxPrice: active ? undefined : range.maxPrice,
                      })}
                      active={active}
                    >
                      {range.label}
                    </FilterLink>
                  );
                })}
              </FilterGroup>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-dark-border/20">
              <p className="text-sm text-ivory/42 flex items-center gap-2">
                <Filter size={15} className="text-gold" />
                <span className="text-ivory/75 font-medium">{data.total}</span>
                sản phẩm phù hợp
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SORT_OPTIONS.map((option) => (
                  <Link
                    key={option.value}
                    href={buildHref(params, { sort: option.value })}
                    className={`px-3 py-2 text-xs border transition-colors whitespace-nowrap ${
                      selectedSort === option.value
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-dark-border/40 text-ivory/45 hover:text-ivory/75"
                    }`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </div>

            {data.watches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                {data.watches.map((watch) => (
                  <ProductCard key={watch.id} watch={watch} showDiscount />
                ))}
              </div>
            ) : (
              <div className="border border-dark-border/30 bg-dark-card/30 py-20 px-6 text-center">
                <h2 className="heading-serif text-2xl text-ivory">
                  Không tìm thấy sản phẩm
                </h2>
                <p className="text-sm text-ivory/42 mt-3">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                </p>
                <Link href="/bo-suu-tap" className="btn-outline-gold mt-6">
                  Xóa bộ lọc
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-dark-border/20 pt-4">
      <h3 className="text-xs uppercase tracking-wider text-ivory/45 font-semibold mb-3">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-gold/10 text-gold border border-gold/20"
          : "text-ivory/45 hover:text-ivory/75 hover:bg-white/[0.03]"
      }`}
    >
      {children}
    </Link>
  );
}
