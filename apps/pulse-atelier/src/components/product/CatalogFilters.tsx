import { Search, SlidersHorizontal } from "lucide-react";
import { categories } from "@/data/categories";
import type { CatalogSort } from "@/lib/catalog";
import type { Ecosystem, ProductCategory, UseCase } from "@/types/domain";
import { Button } from "@/components/ui/Button";

interface CatalogFiltersProps {
  values: {
    q?: string;
    category?: ProductCategory;
    ecosystem?: Ecosystem;
    useCase?: UseCase;
    sort: CatalogSort;
  };
}

const ecosystems: { value: Ecosystem; label: string }[] = [
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "windows", label: "Windows" },
  { value: "cross-platform", label: "Da he" },
];

const useCases: { value: UseCase; label: string }[] = [
  { value: "work", label: "Lam viec" },
  { value: "fitness", label: "Tap luyen" },
  { value: "travel", label: "Di chuyen" },
  { value: "study", label: "Hoc tap" },
  { value: "focus", label: "Tap trung" },
  { value: "gaming", label: "Gaming" },
  { value: "everyday", label: "Moi ngay" },
  { value: "entertainment", label: "Giai tri" },
];

const sortOptions: { value: CatalogSort; label: string }[] = [
  { value: "featured", label: "Noi bat" },
  { value: "popular", label: "Ban chay" },
  { value: "rating", label: "Danh gia" },
  { value: "newest", label: "Moi nhat" },
  { value: "price-asc", label: "Gia tang" },
  { value: "price-desc", label: "Gia giam" },
  { value: "battery", label: "Pin lau" },
];

export function CatalogFilters({ values }: CatalogFiltersProps) {
  return (
    <form
      action="/san-pham"
      className="rounded-lg border border-line bg-panel p-4"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-frost">
        <SlidersHorizontal size={17} className="text-pulse" aria-hidden="true" />
        Bo loc nhanh
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Tim san pham</span>
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={values.q}
            placeholder="Tim theo ten, cam bien, SKU..."
            className="min-h-11 w-full rounded-lg border border-line bg-graphite py-2 pl-10 pr-3 text-sm text-frost outline-none transition-colors placeholder:text-steel/75 focus:border-pulse"
          />
        </label>

        <label>
          <span className="sr-only">Danh muc</span>
          <select
            name="category"
            defaultValue={values.category ?? ""}
            className="min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none transition-colors focus:border-pulse"
          >
            <option value="">Tat ca danh muc</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">He sinh thai</span>
          <select
            name="ecosystem"
            defaultValue={values.ecosystem ?? ""}
            className="min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none transition-colors focus:border-pulse"
          >
            <option value="">Moi he sinh thai</option>
            {ecosystems.map((ecosystem) => (
              <option key={ecosystem.value} value={ecosystem.value}>
                {ecosystem.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Nhu cau</span>
          <select
            name="useCase"
            defaultValue={values.useCase ?? ""}
            className="min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none transition-colors focus:border-pulse"
          >
            <option value="">Moi nhip song</option>
            {useCases.map((useCase) => (
              <option key={useCase.value} value={useCase.value}>
                {useCase.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-[1fr_auto] gap-2 md:col-span-2 xl:col-span-1">
          <label>
            <span className="sr-only">Sap xep</span>
            <select
              name="sort"
              defaultValue={values.sort}
              className="min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none transition-colors focus:border-pulse"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit">Loc</Button>
        </div>
      </div>
    </form>
  );
}
