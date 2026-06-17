import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { getCustomerWishlist } from "@/data/wishlist";
import { toggleWishlistAction } from "@/app/actions/wishlist";
import ProductCard from "@/components/product/ProductCard";

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/dang-nhap");
  }

  const wishlist = await getCustomerWishlist(session.user.id);

  return (
    <div className="min-h-screen pb-16">
      <section className="relative py-14 bg-dark-surface/30 border-b border-dark-border/20">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-2 text-gold mb-3">
            <Heart size={18} />
            <span className="text-xs uppercase tracking-[0.3em]">
              Wishlist
            </span>
          </div>
          <h1 className="heading-serif text-3xl sm:text-4xl text-ivory">
            Danh sách yêu thích
          </h1>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {wishlist.map((watch) => (
              <div key={watch.id} className="space-y-3">
                <ProductCard watch={watch} />
                <form
                  action={async () => {
                    "use server";
                    await toggleWishlistAction(watch.id);
                  }}
                >
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 border border-dark-border/40 text-ivory/45 hover:text-red-400 hover:border-red-500/30 py-2 text-xs"
                  >
                    <Trash2 size={13} />
                    Xóa khỏi wishlist
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dark-border/30 bg-dark-card/30 py-20 px-6 text-center">
            <Heart size={32} className="text-gold mx-auto mb-4" />
            <h2 className="heading-serif text-2xl text-ivory">
              Chưa có sản phẩm yêu thích
            </h2>
            <p className="text-sm text-ivory/42 mt-3 mb-6">
              Lưu các mẫu đồng hồ bạn quan tâm để quay lại so sánh nhanh.
            </p>
            <Link href="/bo-suu-tap" className="btn-gold px-5 py-3 text-sm">
              Khám phá bộ sưu tập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
