import Link from "next/link";
import { ArrowRight, Crown, Gem, ShieldCheck, Sparkles } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { getHomeCatalogData } from "@/data/catalog";

export default async function HomePage() {
  const { brands, featuredWatches, bestSellers, saleWatches } =
    await getHomeCatalogData();
  const heroWatch = featuredWatches[0] || bestSellers[0] || saleWatches[0];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-dark-border/20 bg-dark-bg">
        <div className="absolute inset-0 hero-gradient opacity-70" />
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/[0.04] text-gold/80 text-[11px] uppercase tracking-[0.28em] mb-6">
                <Crown size={14} />
                Đại lý đồng hồ cao cấp
              </div>
              <h1 className="heading-serif text-4xl sm:text-5xl lg:text-7xl text-ivory leading-[1.05]">
                Tempus VN
                <span className="block text-gold mt-2">
                  Curated Timepieces
                </span>
              </h1>
              <p className="text-ivory/48 text-sm sm:text-base max-w-2xl mt-6 leading-7">
                Tuyển chọn đồng hồ chính hãng từ các thương hiệu danh tiếng,
                tập trung vào tính xác thực, bảo hành và trải nghiệm mua hàng
                xứng tầm nhà sưu tầm.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link href="/bo-suu-tap" className="btn-gold px-7 py-3.5">
                  <Gem size={16} />
                  Khám phá bộ sưu tập
                </Link>
                <Link
                  href="/bao-hanh"
                  className="btn-outline-gold px-7 py-3.5"
                >
                  Dịch vụ bảo hành
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-10 max-w-xl">
                {[
                  ["500+", "Mẫu tuyển chọn"],
                  [brands.length.toString(), "Thương hiệu"],
                  ["100%", "Chính hãng"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="heading-serif text-2xl text-gold">{value}</p>
                    <p className="text-[11px] uppercase tracking-wider text-ivory/32 mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {heroWatch && (
              <div className="relative">
                <div className="absolute -inset-6 border border-gold/10" />
                <ProductCard watch={heroWatch} showDiscount />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 border-b border-dark-border/20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-gold/60 text-xs tracking-[0.3em] uppercase font-medium mb-3">
                Đối tác chính hãng
              </p>
              <h2 className="heading-serif text-3xl text-ivory">
                Thương hiệu tiêu biểu
              </h2>
            </div>
            <Link
              href="/thuong-hieu"
              className="hidden sm:flex text-sm text-gold/70 hover:text-gold items-center gap-2"
            >
              Xem thương hiệu
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {brands.slice(0, 8).map((brand) => (
              <Link
                key={brand.id}
                href={`/bo-suu-tap?brand=${brand.slug}`}
                className="aspect-square border border-dark-border/40 bg-dark-card/30 hover:border-gold/30 transition-colors flex flex-col items-center justify-center p-4 text-center"
              >
                <span className="heading-serif text-2xl text-gold/80">
                  {brand.name.charAt(0)}
                </span>
                <span className="text-[11px] text-ivory/55 mt-2">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductSection
        eyebrow="Được chọn lọc"
        title="Bộ sưu tập nổi bật"
        watches={featuredWatches}
        href="/bo-suu-tap?featured=true"
      />
      <ProductSection
        eyebrow="Collector demand"
        title="Bán chạy nhất"
        watches={bestSellers}
        href="/bo-suu-tap?sort=bestseller"
        muted
      />
      <ProductSection
        eyebrow="Ưu đãi giới hạn"
        title="Giá tốt trong tuần"
        watches={saleWatches}
        href="/bo-suu-tap?sort=sale"
      />

      <section className="py-14 lg:py-20 bg-dark-surface/30 border-t border-dark-border/20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 grid md:grid-cols-3 gap-4">
          {[
            ["Xác thực", "Kiểm định nguồn gốc và tình trạng trước khi giao."],
            ["Bảo hành", "Bảo hành theo hãng và hỗ trợ hậu mãi tại Tempus."],
            ["Giao nhận", "Đóng gói bảo mật, tư vấn riêng cho đơn giá trị cao."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="border border-dark-border/30 bg-dark-card/30 p-6"
            >
              <ShieldCheck size={20} className="text-gold mb-4" />
              <h3 className="heading-serif text-xl text-ivory">{title}</h3>
              <p className="text-sm text-ivory/42 mt-3 leading-6">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 text-center">
          <Sparkles size={28} className="text-gold mx-auto mb-4" />
          <h2 className="heading-serif text-3xl text-ivory">
            Nhận tư vấn bộ sưu tập riêng
          </h2>
          <p className="text-sm text-ivory/42 mt-4 leading-6">
            Đội ngũ Tempus hỗ trợ chọn đồng hồ theo ngân sách, phong cách và
            mục tiêu sưu tầm.
          </p>
          <Link href="/lien-he" className="btn-gold px-7 py-3.5 mt-7 inline-flex">
            Liên hệ tư vấn
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProductSection({
  eyebrow,
  title,
  watches,
  href,
  muted,
}: {
  eyebrow: string;
  title: string;
  watches: Awaited<ReturnType<typeof getHomeCatalogData>>["featuredWatches"];
  href: string;
  muted?: boolean;
}) {
  if (watches.length === 0) return null;

  return (
    <section className={`py-14 lg:py-20 ${muted ? "bg-dark-surface/35" : ""}`}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase font-medium mb-3">
              {eyebrow}
            </p>
            <h2 className="heading-serif text-3xl text-ivory">{title}</h2>
          </div>
          <Link
            href={href}
            className="text-sm text-gold/70 hover:text-gold flex items-center gap-2"
          >
            Xem tất cả
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {watches.slice(0, 4).map((watch) => (
            <ProductCard key={watch.id} watch={watch} showDiscount />
          ))}
        </div>
      </div>
    </section>
  );
}
