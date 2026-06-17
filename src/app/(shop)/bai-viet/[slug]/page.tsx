import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Calendar, ChevronLeft, Clock, Eye } from "lucide-react";
import { getBlogBySlug, getPublishedBlogs } from "@/data/blogs";
import { getRelativeTime } from "@/lib/utils";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const relatedPosts = (await getPublishedBlogs())
    .filter((post) => post.id !== blog.id)
    .slice(0, 3);

  return (
    <article className="min-h-screen pb-16">
      <div className="relative h-[50vh] sm:h-[60vh] w-full overflow-hidden">
        <Image
          src={blog.image || "/file.svg"}
          alt={blog.title}
          fill
          className="object-cover brightness-[0.4]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />

        <div className="absolute bottom-0 inset-x-0">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 pb-8">
            <Link
              href="/bai-viet"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gold hover:text-gold-light transition-colors mb-6"
            >
              <ChevronLeft size={16} />
              Quay lại tạp chí
            </Link>

            <span className="badge-gold mb-4">Magazine</span>
            <h1 className="heading-serif text-3xl sm:text-4xl md:text-5xl text-ivory mb-6 leading-[1.2] text-balance">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-ivory/50 border-t border-dark-border/20 pt-6">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(blog.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {getRelativeTime(blog.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={13} />
                {blog.views.toLocaleString()} lượt xem
              </span>
              <span>
                Tác giả:{" "}
                <strong className="text-gold/80">
                  {blog.author.name || "Tempus Editorial"}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 mt-10">
        <div className="glass-dark p-6 sm:p-10 border border-dark-border/30 text-ivory/80 text-base leading-relaxed space-y-6">
          {blog.excerpt && (
            <p className="text-lg font-medium text-ivory/90 leading-relaxed italic border-l-2 border-gold pl-4 py-1">
              {blog.excerpt}
            </p>
          )}
          <div className="whitespace-pre-line text-ivory/75 leading-8">
            {blog.content}
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-dark-border/20">
            <div className="flex items-center gap-2 mb-8">
              <BookOpen size={18} className="text-gold" />
              <h2 className="heading-serif text-2xl text-ivory">
                Bài viết liên quan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/bai-viet/${post.slug}`}
                  className="group block"
                >
                  <article className="card-luxury overflow-hidden h-full">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={post.image || "/file.svg"}
                        alt={post.title}
                        fill
                        className="object-cover product-image"
                        sizes="(max-width: 640px) 100vw, 30vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-ivory/90 group-hover:text-gold transition-colors line-clamp-2 leading-relaxed mb-2">
                        {post.title}
                      </h3>
                      <span className="text-[10px] text-ivory/30">
                        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
