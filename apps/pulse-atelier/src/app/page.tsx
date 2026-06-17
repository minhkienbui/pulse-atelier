import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackageCheck, RotateCcw, ShieldCheck, Smartphone } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RhythmFinder } from "@/components/finder/RhythmFinder";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import type { Product, ProductCategory, Ecosystem, UseCase, ProductStatus } from "@/types/domain";

const categoryCopy = {
  watch: "Smartwatches",
  earbuds: "Earbuds",
  band: "Bands",
  tablet: "Tablets",
  accessory: "Smart accessories",
};

const trustBlocks = [
  {
    title: "Bao hanh ro rang",
    copy: "12-24 thang tuy dong san pham, thong tin hien ngay tren tung thiet bi.",
    icon: ShieldCheck,
  },
  {
    title: "Tuong thich truoc khi mua",
    copy: "Loc theo iOS, Android, Windows hoac da he sinh thai.",
    icon: Smartphone,
  },
  {
    title: "Doi tra gon",
    copy: "Trang san pham neu ro ton kho, phu kien va ghi chu phu hop.",
    icon: RotateCcw,
  },
  {
    title: "Curated by rhythm",
    copy: "Lua chon theo cach ban lam viec, tap luyen, hoc tap va nghi ngoi.",
    icon: PackageCheck,
  },
];

const guideLinks: Record<string, string> = {
  "article-rhythm-finder": "/san-pham?useCase=everyday",
  "article-battery-care": "/san-pham?sort=battery",
  "article-focus-setup": "/san-pham?useCase=focus",
};

export default async function HomePage() {
  const rawProducts = await db.product.findMany();
  const categories = await db.category.findMany();
  const articles = await db.article.findMany();
  const heroBanners = await db.heroBanner.findMany();

  const products: Product[] = rawProducts.map((p) => ({
    ...p,
    categoryId: p.categoryId as ProductCategory,
    ecosystems: p.ecosystems as Ecosystem[],
    useCases: p.useCases as UseCase[],
    badges: p.badges as any[],
    status: p.status as ProductStatus,
    originalPrice: p.originalPrice ?? undefined,
    waterResistance: p.waterResistance ?? undefined,
    anc: p.anc ?? undefined,
    weightGrams: p.weightGrams ?? undefined,
  }));

  const hero = heroBanners[0] || { title: "Pulse Atelier", subtitle: "", ctaLabel: "Catalog", ctaHref: "/san-pham", productId: "" };
  const heroProduct = products.find((product) => product.id === hero.productId) ?? products[0];
  const featuredProducts = products.filter((product) => product.status === "active" && product.isFeatured).slice(0, 4);
  const bundleBase = products.find((product) => product.slug === "aura-watch-pro") ?? products[0];
  const bundleProducts = products.filter((product) => bundleBase.bundleProductIds.includes(product.id));
  const bundleTotal = [bundleBase, ...bundleProducts].reduce((total, product) => total + product.price, 0);
  const guideArticles = articles.filter((article) => article.published).slice(0, 3);


  return (
    <CustomerShell>
      <section className="shell grid gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div>
          <Badge variant="mint">Pulse Atelier</Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-frost text-balance sm:text-6xl">
            Wearable intelligence, curated for your rhythm.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-steel">
            Mot mat tien mua sam cho dong ho, tai nghe, tablet va phu kien thong
            minh, duoc sap theo nhu cau that trong ngay.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/san-pham"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
            >
              Xem catalog
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href="#rhythm-finder"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-panel-soft px-4 text-sm font-semibold text-frost transition-colors hover:border-pulse/50 hover:bg-panel"
            >
              Mo Rhythm Finder
            </Link>
          </div>
        </div>

        <Link
          href={hero.ctaHref}
          className="group overflow-hidden rounded-lg border border-line bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
        >
          <div className="relative aspect-[5/4] overflow-hidden bg-graphite">
            <Image
              src={heroProduct.image}
              alt={hero.title}
              fill
              priority
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="p-5">
            <p className="text-sm font-semibold uppercase text-pulse">{hero.ctaLabel}</p>
            <h2 className="mt-2 text-2xl font-semibold text-frost">{hero.title}</h2>
            <p className="mt-2 text-sm leading-6 text-steel">{hero.subtitle}</p>
          </div>
        </Link>
      </section>

      <section className="shell py-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/san-pham?category=${category.id}`}
              className="rounded-lg border border-line bg-panel p-4 transition-colors hover:border-pulse/50 hover:bg-panel-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
            >
              <p className="text-xs font-semibold uppercase text-pulse">{categoryCopy[category.id as ProductCategory]}</p>
              <h2 className="mt-2 text-lg font-semibold text-frost">{category.name}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <RhythmFinder />

      <section className="shell py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="violet">Featured</Badge>
            <h2 className="mt-3 text-3xl font-semibold text-frost">Thiet bi dang duoc chon nhieu</h2>
          </div>
          <Link href="/san-pham?sort=popular" className="text-sm font-semibold text-pulse hover:text-frost">
            Xem san pham ban chay
          </Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="shell grid gap-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-line bg-panel p-6">
          <Badge variant="mint">Curated bundle</Badge>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-frost">
            Aura workday kit
          </h2>
          <p className="mt-3 text-sm leading-6 text-steel">
            Dong ho, de sac va day deo du phong cho mot ngay lam viec gon hon.
          </p>
          <p className="mt-6 text-2xl font-semibold text-frost">{formatCurrency(bundleTotal)}</p>
          <Link
            href={`/san-pham/${bundleBase.slug}`}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
          >
            Xem goi
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[bundleBase, ...bundleProducts].map((product) => (
            <Link
              key={product.id}
              href={`/san-pham/${product.slug}`}
              className="overflow-hidden rounded-lg border border-line bg-panel transition-colors hover:border-pulse/45"
            >
              <div className="relative aspect-square bg-graphite">
                <Image src={product.image} alt={product.name} fill sizes="33vw" className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-frost">{product.name}</h3>
                <p className="mt-1 text-xs text-steel">{formatCurrency(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {trustBlocks.map((block) => {
          const Icon = block.icon;

          return (
            <article key={block.title} className="rounded-lg border border-line bg-panel p-5">
              <Icon size={22} className="text-pulse" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold text-frost">{block.title}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{block.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="shell py-12">
        <div className="mb-6">
          <Badge variant="neutral">Buying guides</Badge>
          <h2 className="mt-3 text-3xl font-semibold text-frost">Doc nhanh truoc khi chon</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {guideArticles.map((article) => (
            <article key={article.id} className="rounded-lg border border-line bg-panel p-5">
              <p className="text-xs font-semibold uppercase text-pulse">{article.category}</p>
              <h3 className="mt-3 text-lg font-semibold leading-snug text-frost">{article.title}</h3>
              <p className="mt-2 text-sm leading-6 text-steel">{article.excerpt}</p>
              <Link
                href={guideLinks[article.id] ?? "/san-pham"}
                className="mt-5 inline-flex text-sm font-semibold text-pulse hover:text-frost"
              >
                Xem goi y
              </Link>
            </article>
          ))}
        </div>
      </section>
    </CustomerShell>
  );
}
