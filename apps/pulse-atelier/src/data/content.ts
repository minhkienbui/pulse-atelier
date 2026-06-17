import type { Article, HeroBanner } from "@/types/domain";

export const articles: Article[] = [
  {
    id: "article-rhythm-finder",
    title: "Chon thiet bi theo nhip song hang ngay",
    slug: "chon-thiet-bi-theo-nhip-song",
    excerpt: "Cach ket hop dong ho, tai nghe va tablet theo nhu cau lam viec, tap luyen va nghi ngoi.",
    category: "Guide",
    published: true,
  },
  {
    id: "article-battery-care",
    title: "Cham soc pin cho wearable va tai nghe",
    slug: "cham-soc-pin-wearable",
    excerpt: "Nhung thoi quen sac giup thiet bi giu dung luong tot hon trong lich trinh ban ron.",
    category: "Care",
    published: true,
  },
  {
    id: "article-focus-setup",
    title: "Goc lam viec tap trung voi audio thong minh",
    slug: "goc-lam-viec-tap-trung",
    excerpt: "Thiet lap tai nghe, thong bao va man hinh phu de giam nhieu tac vu trong ngay.",
    category: "Workspace",
    published: true,
  },
];

export const heroBanners: HeroBanner[] = [
  {
    id: "hero-aura-watch",
    title: "Aura Watch Pro",
    subtitle: "Theo doi suc khoe, lich trinh va tap luyen trong mot thiet bi deo cao cap.",
    ctaLabel: "Xem dong ho",
    ctaHref: "/san-pham/aura-watch-pro",
    productId: "prod-aura-watch-pro",
  },
  {
    id: "hero-focus-buds",
    title: "Sony Focus Buds",
    subtitle: "Khong gian yen tinh hon cho cong viec sau, di chuyen va nghi ngoi.",
    ctaLabel: "Nghe thu",
    ctaHref: "/san-pham/sony-focus-buds",
    productId: "prod-sony-focus-buds",
  },
];
