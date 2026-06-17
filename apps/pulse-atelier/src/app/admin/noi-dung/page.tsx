"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/admin-store";
import type { Article, HeroBanner } from "@/types/domain";

interface HeroFormState {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  productId: string;
}

interface ArticleFormState {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published: boolean;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminContentPage() {
  const products = useAdminStore((state) => state.products);
  const heroBanners = useAdminStore((state) => state.heroBanners);
  const articles = useAdminStore((state) => state.articles);
  const addHeroBanner = useAdminStore((state) => state.addHeroBanner);
  const updateHeroBanner = useAdminStore((state) => state.updateHeroBanner);
  const deleteHeroBanner = useAdminStore((state) => state.deleteHeroBanner);
  const addArticle = useAdminStore((state) => state.addArticle);
  const updateArticle = useAdminStore((state) => state.updateArticle);
  const deleteArticle = useAdminStore((state) => state.deleteArticle);
  const [editingHeroId, setEditingHeroId] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [heroForm, setHeroForm] = useState<HeroFormState>({
    title: "",
    subtitle: "",
    ctaLabel: "",
    ctaHref: "/san-pham",
    productId: products[0]?.id ?? "",
  });
  const [articleForm, setArticleForm] = useState<ArticleFormState>({
    title: "",
    slug: "",
    excerpt: "",
    category: "Guide",
    published: true,
  });

  const resetHeroForm = () => {
    setEditingHeroId(null);
    setHeroForm({ title: "", subtitle: "", ctaLabel: "", ctaHref: "/san-pham", productId: products[0]?.id ?? "" });
  };

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setArticleForm({ title: "", slug: "", excerpt: "", category: "Guide", published: true });
  };

  const loadHero = (hero: HeroBanner) => {
    setEditingHeroId(hero.id);
    setHeroForm({
      title: hero.title,
      subtitle: hero.subtitle,
      ctaLabel: hero.ctaLabel,
      ctaHref: hero.ctaHref,
      productId: hero.productId,
    });
  };

  const loadArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setArticleForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      published: article.published,
    });
  };

  const handleHeroSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      title: heroForm.title.trim(),
      subtitle: heroForm.subtitle.trim(),
      ctaLabel: heroForm.ctaLabel.trim(),
      ctaHref: heroForm.ctaHref.trim(),
      productId: heroForm.productId,
    };

    if (!payload.title || !payload.subtitle || !payload.ctaLabel || !payload.ctaHref || !payload.productId) return;

    if (editingHeroId) {
      updateHeroBanner(editingHeroId, payload);
    } else {
      addHeroBanner(payload);
    }

    resetHeroForm();
  };

  const handleArticleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = articleForm.title.trim();
    const payload = {
      title,
      slug: articleForm.slug.trim() || slugify(title),
      excerpt: articleForm.excerpt.trim(),
      category: articleForm.category.trim(),
      published: articleForm.published,
    };

    if (!payload.title || !payload.slug || !payload.excerpt || !payload.category) return;

    if (editingArticleId) {
      updateArticle(editingArticleId, payload);
    } else {
      addArticle(payload);
    }

    resetArticleForm();
  };

  const heroColumns: AdminColumn<HeroBanner>[] = [
    { header: "Hero", cell: (hero) => <span className="font-semibold text-frost">{hero.title}</span> },
    { header: "Subtitle", cell: (hero) => hero.subtitle },
    {
      header: "CTA",
      cell: (hero) => (
        <Link href={hero.ctaHref} className="font-semibold text-pulse hover:text-frost">
          {hero.ctaLabel}
        </Link>
      ),
    },
    { header: "Product", cell: (hero) => products.find((product) => product.id === hero.productId)?.name ?? hero.productId },
    {
      header: "Hanh dong",
      cell: (hero) => (
        <div className="flex gap-3">
          <button type="button" onClick={() => loadHero(hero)} className="font-semibold text-pulse hover:text-frost">
            Sua
          </button>
          <button
            type="button"
            onClick={() => deleteHeroBanner(hero.id)}
            className="font-semibold text-danger hover:text-frost"
          >
            Xoa
          </button>
        </div>
      ),
    },
  ];
  const articleColumns: AdminColumn<Article>[] = [
    { header: "Article", cell: (article) => <span className="font-semibold text-frost">{article.title}</span> },
    { header: "Category", cell: (article) => article.category },
    { header: "Excerpt", cell: (article) => article.excerpt },
    {
      header: "Status",
      cell: (article) => <Badge variant={article.published ? "mint" : "neutral"}>{article.published ? "published" : "draft"}</Badge>,
    },
    {
      header: "Hanh dong",
      cell: (article) => (
        <div className="flex gap-3">
          <button type="button" onClick={() => loadArticle(article)} className="font-semibold text-pulse hover:text-frost">
            Sua
          </button>
          <button
            type="button"
            onClick={() => deleteArticle(article.id)}
            className="font-semibold text-danger hover:text-frost"
          >
            Xoa
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Content"
        title="Noi dung storefront"
        description="Quan ly hero banners va buying guide teasers dang xuat hien o mat tien mua sam."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="grid gap-6">
          <AdminDataTable title="Hero banners" rows={heroBanners} columns={heroColumns} getRowKey={(hero) => hero.id} />
          <AdminDataTable title="Buying guides" rows={articles} columns={articleColumns} getRowKey={(article) => article.id} />
        </div>
        <div className="space-y-6">
          <AdminActionPanel
            title={editingHeroId ? "Sua hero banner" : "Them hero banner"}
            description="Cap nhat noi dung hero va CTA cua storefront."
          >
            <form onSubmit={handleHeroSubmit} className="grid gap-4">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Title</span>
                <input
                  value={heroForm.title}
                  onChange={(event) => setHeroForm((current) => ({ ...current, title: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Subtitle</span>
                <textarea
                  value={heroForm.subtitle}
                  onChange={(event) => setHeroForm((current) => ({ ...current, subtitle: event.target.value }))}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase text-steel">CTA label</span>
                  <input
                    value={heroForm.ctaLabel}
                    onChange={(event) => setHeroForm((current) => ({ ...current, ctaLabel: event.target.value }))}
                    className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase text-steel">CTA href</span>
                  <input
                    value={heroForm.ctaHref}
                    onChange={(event) => setHeroForm((current) => ({ ...current, ctaHref: event.target.value }))}
                    className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                  />
                </label>
              </div>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Product</span>
                <select
                  value={heroForm.productId}
                  onChange={(event) => setHeroForm((current) => ({ ...current, productId: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="submit">{editingHeroId ? "Luu hero" : "Them hero"}</Button>
                <Button type="button" variant="secondary" onClick={resetHeroForm}>
                  Lam moi
                </Button>
              </div>
            </form>
          </AdminActionPanel>

          <AdminActionPanel
            title={editingArticleId ? "Sua article" : "Them article"}
            description="Quan ly teaser bai viet tu van mua sam."
          >
            <form onSubmit={handleArticleSubmit} className="grid gap-4">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Title</span>
                <input
                  value={articleForm.title}
                  onChange={(event) => setArticleForm((current) => ({ ...current, title: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Slug</span>
                <input
                  value={articleForm.slug}
                  onChange={(event) => setArticleForm((current) => ({ ...current, slug: event.target.value }))}
                  placeholder="tu-dong-tao-neu-de-trong"
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none placeholder:text-steel/70 focus:border-pulse"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Excerpt</span>
                <textarea
                  value={articleForm.excerpt}
                  onChange={(event) => setArticleForm((current) => ({ ...current, excerpt: event.target.value }))}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Category</span>
                <input
                  value={articleForm.category}
                  onChange={(event) => setArticleForm((current) => ({ ...current, category: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-line bg-graphite p-3 text-sm font-semibold text-frost">
                <input
                  type="checkbox"
                  checked={articleForm.published}
                  onChange={(event) => setArticleForm((current) => ({ ...current, published: event.target.checked }))}
                  className="h-4 w-4 accent-pulse"
                />
                Published
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="submit">{editingArticleId ? "Luu article" : "Them article"}</Button>
                <Button type="button" variant="secondary" onClick={resetArticleForm}>
                  Lam moi
                </Button>
              </div>
            </form>
          </AdminActionPanel>
        </div>
      </div>
    </AdminShell>
  );
}
