import Link from "next/link";
import { ArrowRight, Award, Calendar, Compass, MapPin } from "lucide-react";
import { getActiveBrands } from "@/data/catalog";

export default async function BrandsPage() {
  const brands = await getActiveBrands();

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <section className="relative py-20 bg-dark-surface/30 border-b border-dark-border/20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-60" />
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-gold mb-2">
            <Award size={12} className="text-gold" />
            <span className="text-[10px] font-semibold text-gold tracking-wider uppercase">
              Đối tác ủy quyền
            </span>
          </div>
          <h1 className="heading-serif text-4xl sm:text-5xl text-ivory">
            Thương hiệu đẳng cấp
          </h1>
          <p className="text-sm text-ivory/50 max-w-xl mx-auto leading-relaxed">
            Nơi hội tụ những tinh hoa chế tác đồng hồ thế giới, được quản lý
            trực tiếp từ hệ thống thương hiệu đang hoạt động của Tempus.
          </p>
          <div className="line-gold w-16 h-[2px] bg-gold mt-4 mx-auto" />
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16">
        {brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {brands.map((brand) => (
              <article
                key={brand.id}
                className="glass-dark p-6 sm:p-8 border border-dark-border/30 hover:border-gold/30 transition-all duration-500 flex flex-col justify-between h-full space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-14 h-14 rounded-full bg-dark-border/20 flex items-center justify-center border border-dark-border">
                      <span className="text-xl font-bold text-gold heading-serif">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-4 text-[11px] text-ivory/40">
                      {brand.country && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-gold/60" />
                          {brand.country}
                        </span>
                      )}
                      {brand.foundedYear && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-gold/60" />
                          {brand.foundedYear}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="heading-serif text-2xl text-ivory">
                      {brand.name}
                    </h2>
                    {brand.description && (
                      <p className="text-xs text-ivory/50 leading-relaxed">
                        {brand.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-dark-border/10 pt-4 flex items-center justify-between gap-4">
                  <span className="text-[10px] text-gold/50 uppercase tracking-widest font-mono">
                    Authorized collection
                  </span>
                  <Link
                    href={`/bo-suu-tap?brand=${brand.slug}`}
                    className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors"
                  >
                    Xem sản phẩm
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dark-border/30 bg-dark-card/30 py-20 px-6 text-center">
            <h2 className="heading-serif text-2xl text-ivory">
              Chưa có thương hiệu
            </h2>
            <p className="text-sm text-ivory/42 mt-3">
              Danh sách thương hiệu đang được cập nhật.
            </p>
          </div>
        )}
      </section>

      <section className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="p-8 sm:p-12 glass-gold border border-gold/10 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <Compass size={28} className="text-gold mx-auto" />
            <h3 className="heading-serif text-xl sm:text-2xl text-ivory">
              Tìm thiết kế phù hợp?
            </h3>
            <p className="text-xs text-ivory/40 leading-relaxed">
              Lọc sản phẩm theo thương hiệu, mức giá, bộ máy và danh mục trong
              bộ sưu tập Tempus.
            </p>
            <Link
              href="/bo-suu-tap"
              className="btn-gold text-[11px] py-3 px-6 inline-flex items-center gap-2 mt-2"
            >
              Đến bộ lọc tìm kiếm
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
