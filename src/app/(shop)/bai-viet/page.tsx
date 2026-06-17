import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronRight, Clock, Eye, Search } from "lucide-react";
import { getPublishedBlogs } from "@/data/blogs";
import { getRelativeTime } from "@/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const query = firstParam(params, "q") || "";
  const blogs = await getPublishedBlogs(query);
  const featured = blogs[0];
  const remaining = blogs.slice(1);

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 bg-dark-surface/30 border-b border-dark-border/20">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-4">
            <BookOpen size={14} className="text-gold" />
            <span className="text-xs font-semibold text-gold tracking-wider uppercase">
              Tạp chí Tempus
            </span>
          </div>
          <h1 className="heading-serif text-4xl sm:text-5xl text-ivory mb-4">
            Bài viết & Magazine
          </h1>
          <p className="text-ivory/40 max-w-xl mx-auto text-sm leading-relaxed">
            Câu chuyện thương hiệu, hướng dẫn chăm sóc và góc nhìn sưu tầm từ
            đội ngũ Tempus.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <form action="/bai-viet" className="relative w-full sm:w-80 mb-10">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
          />
          <input
            name="q"
            defaultValue={query}
            type="text"
            placeholder="Tìm bài viết..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-dark-card border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20"
          />
        </form>

        {featured ? (
          <>
            <Link href={`/bai-viet/${featured.slug}`} className="group block mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden bg-dark-card border border-dark-border/30 hover:border-gold/20 transition-all duration-500">
                <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                  <Image
                    src={featured.image || "/file.svg"}
                    alt={featured.title}
                    fill
                    className="object-cover product-image"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 lg:p-10 flex flex-col justify-center">
                  <span className="badge-gold w-fit mb-4">
                    Bài viết nổi bật
                  </span>
                  <h2 className="heading-serif text-2xl sm:text-3xl text-ivory group-hover:text-gold transition-colors mb-4 leading-tight">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-sm text-ivory/40 leading-relaxed mb-6 line-clamp-3">
                      {featured.excerpt}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-ivory/30">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {getRelativeTime(featured.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye size={12} />
                      {featured.views.toLocaleString()} lượt xem
                    </span>
                    <span>{featured.author.name || "Tempus Editorial"}</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {remaining.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/bai-viet/${blog.slug}`}
                  className="group block"
                >
                  <article className="card-luxury overflow-hidden h-full">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={blog.image || "/file.svg"}
                        alt={blog.title}
                        fill
                        className="object-cover product-image"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-sm font-semibold text-ivory/90 group-hover:text-gold transition-colors line-clamp-2 mb-2 leading-relaxed">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-xs text-ivory/35 line-clamp-2 leading-relaxed mb-3">
                          {blog.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-ivory/25">
                          {blog.author.name || "Tempus Editorial"}
                        </span>
                        <span className="text-gold/60 text-xs font-medium flex items-center gap-1 group-hover:text-gold transition-colors">
                          Đọc tiếp <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="border border-dark-border/30 bg-dark-card/30 py-20 px-6 text-center">
            <h2 className="heading-serif text-2xl text-ivory">
              Chưa có bài viết
            </h2>
            <p className="text-sm text-ivory/42 mt-3">
              Nội dung editorial đang được cập nhật.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
