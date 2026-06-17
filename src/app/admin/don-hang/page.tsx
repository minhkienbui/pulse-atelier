import {
  AlertCircle,
  DollarSign,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { connection } from "next/server";
import { getAdminOrdersPageData } from "@/data/admin";
import { updateAdminOrderStatusAction } from "@/app/actions/admin-orders";
import { formatPrice } from "@/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

const STATUS_OPTIONS = [
  ["PENDING", "Chờ xử lý"],
  ["CONFIRMED", "Đã xác nhận"],
  ["PROCESSING", "Đang xử lý"],
  ["SHIPPING", "Đang giao"],
  ["COMPLETED", "Hoàn thành"],
  ["CANCELLED", "Đã hủy"],
] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHIPPING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS);

function firstParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await connection();
  const params = (await searchParams) || {};
  const data = await getAdminOrdersPageData({
    q: firstParam(params, "q"),
    status: firstParam(params, "status"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-serif text-2xl text-ivory">
          Quản lý đơn hàng
        </h1>
        <p className="text-xs text-ivory/40">
          Danh sách đơn hàng thật, cập nhật trạng thái trực tiếp vào hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          label="Tổng đơn hàng"
          value={data.total.toLocaleString("vi-VN")}
          icon={ShoppingCart}
          color="text-gold bg-gold/5 border-gold/10"
        />
        <Metric
          label="Chờ xử lý"
          value={data.pendingCount.toLocaleString("vi-VN")}
          icon={AlertCircle}
          color="text-yellow-400 bg-yellow-400/5 border-yellow-400/10"
        />
        <Metric
          label="Đang giao"
          value={data.shippingCount.toLocaleString("vi-VN")}
          icon={Truck}
          color="text-purple-400 bg-purple-400/5 border-purple-400/10"
        />
        <Metric
          label="Doanh thu hoàn tất"
          value={formatPrice(data.completedRevenue)}
          icon={DollarSign}
          color="text-emerald-400 bg-emerald-400/5 border-emerald-400/10"
          compact
        />
      </div>

      <form
        action="/admin/don-hang"
        className="p-4 rounded-xl bg-dark-card border border-dark-border/30 flex flex-col md:flex-row gap-4 justify-between items-center"
      >
        <div className="relative w-full md:w-96">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
          />
          <input
            name="q"
            defaultValue={data.filters.q || ""}
            placeholder="Tìm theo mã đơn, khách hàng, email, sản phẩm..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20"
          />
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <select
            name="status"
            defaultValue={data.filters.status || ""}
            className="flex-1 md:flex-none px-3 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory/70 focus:border-gold/40 cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map(([status, label]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-gold px-4 py-2 text-[11px]">
            Lọc
          </button>
        </div>
      </form>

      <section className="p-6 rounded-xl bg-dark-card border border-dark-border/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border/20 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider text-left">
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4">Ngày đặt</th>
                <th className="py-3 px-4 text-right">Tổng cộng</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-dark-border/10 hover:bg-white/[0.01] transition-colors align-top"
                >
                  <td className="py-4 px-4 text-xs font-mono text-gold/80 font-semibold">
                    {order.orderNumber}
                    <span className="block mt-1 text-[10px] text-ivory/25">
                      {order.paymentMethod}
                      {order.paymentStatus ? ` / ${order.paymentStatus}` : ""}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <p className="font-semibold text-ivory/80">
                      {order.customer}
                    </p>
                    <span className="block text-[10px] text-ivory/35">
                      {order.phone || "Chưa có SĐT"}
                    </span>
                    <span className="block text-[10px] text-ivory/25">
                      {order.email}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-ivory/60 max-w-[280px]">
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between gap-3">
                          <span className="line-clamp-1">
                            {item.quantity} x {item.name}
                          </span>
                          <span className="text-ivory/30 shrink-0">
                            {formatPrice(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-ivory/40">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-4 px-4 text-xs font-bold text-gold text-right">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        STATUS_STYLES[order.status]
                      }`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <form
                      action={updateAdminOrderStatusAction}
                      className="flex justify-end gap-2"
                    >
                      <input type="hidden" name="orderId" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="px-2 py-1.5 text-[11px] bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory/70 focus:border-gold/40 cursor-pointer"
                        aria-label={`Trạng thái ${order.orderNumber}`}
                      >
                        {STATUS_OPTIONS.map(([status, label]) => (
                          <option key={status} value={status}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg border border-gold/35 text-gold hover:bg-gold/10 text-[10px] font-semibold uppercase"
                      >
                        Lưu
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.orders.length === 0 && (
            <div className="py-16 text-center">
              <h2 className="heading-serif text-2xl text-ivory">
                Không tìm thấy đơn hàng
              </h2>
              <p className="text-sm text-ivory/35 mt-2">
                Thử bỏ bộ lọc hoặc nhập từ khóa khác.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  color,
  compact,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color: string;
  compact?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border ${color} flex items-center gap-3`}>
      <div className="p-2 rounded-lg bg-black/40">
        <Icon size={16} />
      </div>
      <div>
        <p className={`font-bold text-ivory ${compact ? "text-sm" : "text-lg"}`}>
          {value}
        </p>
        <p className="text-[10px] text-ivory/40 uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );
}
