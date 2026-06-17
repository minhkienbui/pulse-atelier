import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Heart,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldAlert,
  ShoppingBag,
  User,
} from "lucide-react";
import { auth } from "@/auth";
import { getCustomerAccount } from "@/data/account";
import { getCustomerOrders } from "@/data/orders";
import { getCustomerWishlist } from "@/data/wishlist";
import { updateProfileAction } from "@/app/actions/account";
import { formatPrice } from "@/lib/utils";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/dang-nhap");
  }

  const [account, orders, wishlist] = await Promise.all([
    getCustomerAccount(session.user.id),
    getCustomerOrders(session.user.id),
    getCustomerWishlist(session.user.id),
  ]);

  if (!account) {
    redirect("/dang-nhap");
  }

  const ownedWatches = orders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderNumber: order.orderNumber,
      purchaseDate: order.createdAt,
      status: order.status,
    }))
  );

  return (
    <div className="min-h-screen pb-16">
      <section className="relative py-12 bg-dark-surface/30 border-b border-dark-border/20">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6">
          <span className="badge-gold">
            {account.role === "CUSTOMER" ? "Thành viên Tempus" : account.role}
          </span>
          <h1 className="heading-serif text-3xl text-ivory mt-3">
            {account.name || account.email}
          </h1>
          <p className="text-xs text-ivory/40 mt-2">Email: {account.email}</p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag} label="Đơn hàng" value={orders.length} />
          <StatCard icon={Heart} label="Yêu thích" value={wishlist.length} />
          <StatCard icon={Package} label="Đồng hồ đã mua" value={ownedWatches.length} />
          <StatCard icon={ShieldAlert} label="Bảo hành" value={ownedWatches.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-5 glass-dark p-6 sm:p-8 rounded-2xl border border-dark-border/30">
            <div className="flex items-center gap-2 border-b border-dark-border/20 pb-4 mb-6">
              <User size={18} className="text-gold" />
              <h2 className="heading-serif text-xl text-ivory">
                Thông tin cá nhân
              </h2>
            </div>
            <form action={updateProfileAction} className="space-y-4">
              <Field label="Họ & tên" icon={User}>
                <input
                  name="name"
                  defaultValue={account.name || ""}
                  className="account-input"
                  required
                />
              </Field>
              <Field label="Email" icon={Mail}>
                <input
                  defaultValue={account.email}
                  className="account-input opacity-60"
                  disabled
                />
              </Field>
              <Field label="Số điện thoại" icon={Phone}>
                <input
                  name="phone"
                  defaultValue={account.phone || ""}
                  className="account-input"
                />
              </Field>
              <Field label="Địa chỉ giao hàng" icon={MapPin}>
                <textarea
                  name="address"
                  defaultValue={account.address || ""}
                  rows={3}
                  className="account-input resize-none"
                />
              </Field>
              <button type="submit" className="btn-gold px-5 py-3 text-xs">
                Lưu thay đổi
              </button>
            </form>
          </section>

          <section className="lg:col-span-7 glass-dark p-6 sm:p-8 rounded-2xl border border-dark-border/30">
            <div className="flex items-center justify-between gap-4 border-b border-dark-border/20 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-gold" />
                <h2 className="heading-serif text-xl text-ivory">
                  Lịch sử mua hàng
                </h2>
              </div>
              <Link href="/bo-suu-tap" className="text-xs text-gold">
                Mua thêm
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="border border-dark-border/30 bg-dark-card/20 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-gold">
                          {order.orderNumber}
                        </p>
                        <p className="text-[11px] text-ivory/35 mt-1">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold text-gold">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-[11px] text-ivory/45 mt-1">
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {order.items.map((item) => (
                        <Link
                          key={item.id}
                          href={`/dong-ho/${item.slug}`}
                          className="flex items-center justify-between gap-4 text-xs text-ivory/60 hover:text-gold"
                        >
                          <span>
                            {item.quantity} x {item.name}
                          </span>
                          <span>{formatPrice(item.subtotal)}</span>
                        </Link>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Chưa có đơn hàng"
                description="Các đơn hàng mới sẽ xuất hiện tại đây sau khi bạn thanh toán."
                href="/bo-suu-tap"
                action="Khám phá bộ sưu tập"
              />
            )}
          </section>
        </div>

        <section className="glass-dark p-6 sm:p-8 rounded-2xl border border-dark-border/30">
          <div className="flex items-center justify-between gap-4 border-b border-dark-border/20 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-gold" />
              <h2 className="heading-serif text-xl text-ivory">
                Danh sách yêu thích
              </h2>
            </div>
            <Link href="/wishlist" className="text-xs text-gold">
              Xem tất cả
            </Link>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlist.slice(0, 4).map((watch) => (
                <Link
                  key={watch.id}
                  href={`/dong-ho/${watch.slug}`}
                  className="border border-dark-border/30 bg-dark-card/20 p-4 hover:border-gold/25"
                >
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2">
                    {watch.brand.name}
                  </p>
                  <h3 className="text-sm text-ivory/80 line-clamp-2">
                    {watch.name}
                  </h3>
                  <p className="text-sm text-gold mt-3">
                    {formatPrice(watch.price)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa có sản phẩm yêu thích"
              description="Lưu các mẫu bạn quan tâm để quay lại so sánh nhanh."
              href="/bo-suu-tap"
              action="Xem đồng hồ"
            />
          )}
        </section>

        <section className="glass-dark p-6 sm:p-8 rounded-2xl border border-dark-border/30">
          <div className="flex items-center gap-2 border-b border-dark-border/20 pb-4 mb-6">
            <ShieldAlert size={18} className="text-gold" />
            <h2 className="heading-serif text-xl text-ivory">
              Đồng hồ của tôi
            </h2>
          </div>
          {ownedWatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownedWatches.map((item) => (
                <div
                  key={`${item.orderNumber}-${item.id}`}
                  className="border border-dark-border/30 bg-dark-card/20 p-4"
                >
                  <p className="text-xs text-gold/70">{item.brand}</p>
                  <h3 className="text-sm text-ivory/85 mt-1">{item.name}</h3>
                  <p className="text-[11px] text-ivory/35 mt-2">
                    Đơn hàng: {item.orderNumber}
                  </p>
                  <p className="text-[11px] text-ivory/35">
                    Ngày mua:{" "}
                    {new Date(item.purchaseDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa có đồng hồ đã mua"
              description="Đồng hồ trong các đơn hàng của bạn sẽ được hiển thị tại đây."
              href="/bo-suu-tap"
              action="Chọn đồng hồ"
            />
          )}
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs text-ivory/40 font-medium">{label}</span>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3 top-3.5 text-ivory/25 pointer-events-none"
        />
        {children}
      </div>
    </label>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="border border-dark-border/30 bg-dark-card/30 p-4">
      <Icon size={18} className="text-gold mb-3" />
      <p className="heading-serif text-2xl text-ivory">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-ivory/35 mt-1">
        {label}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="text-center border border-dark-border/20 bg-dark-card/20 py-10 px-4">
      <h3 className="heading-serif text-xl text-ivory">{title}</h3>
      <p className="text-sm text-ivory/42 mt-2 mb-5">{description}</p>
      <Link href={href} className="btn-outline-gold text-xs px-4 py-2">
        {action}
      </Link>
    </div>
  );
}
