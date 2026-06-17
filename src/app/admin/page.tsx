import Link from "next/link";
import { connection } from "next/server";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  FileText,
  Package,
  ShoppingCart,
  Star,
  Users,
  Watch,
} from "lucide-react";
import { getAdminDashboardData } from "@/data/admin";
import { formatPrice, formatPriceShort } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHIPPING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export default async function AdminDashboard() {
  await connection();
  const data = await getAdminDashboardData();
  const maxMonthRevenue = Math.max(
    ...data.monthlyRevenue.map((item) => item.value),
    1
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-serif text-2xl text-ivory mb-1">
          Tổng quan vận hành
        </h1>
        <p className="text-sm text-ivory/40">
          Dữ liệu được tổng hợp trực tiếp từ đơn hàng, kho và khách hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Doanh thu hoàn tất"
          value={formatPriceShort(data.revenue.total)}
          change={data.revenue.changePercent}
          accent="text-emerald-400 bg-emerald-400/10"
        />
        <StatCard
          icon={ShoppingCart}
          label="Tổng đơn hàng"
          value={data.orders.total.toLocaleString("vi-VN")}
          change={data.orders.changePercent}
          accent="text-blue-400 bg-blue-400/10"
        />
        <StatCard
          icon={Users}
          label="Khách hàng"
          value={data.customers.total.toLocaleString("vi-VN")}
          change={data.customers.changePercent}
          accent="text-enamel bg-enamel/20"
        />
        <StatCard
          icon={AlertTriangle}
          label="Sắp hết hàng"
          value={data.inventory.lowStock.toLocaleString("vi-VN")}
          change={data.inventory.outOfStock * -1}
          accent="text-amber-400 bg-amber-400/10"
          inverse
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 p-6 rounded-xl bg-dark-card border border-dark-border/30">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-ivory/80">
                Doanh thu 12 tháng gần nhất
              </h2>
              <p className="text-xs text-ivory/30 mt-0.5">
                Chỉ tính đơn hàng trạng thái hoàn thành.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-gold/10 text-gold border border-gold/20 text-xs font-medium">
              {formatPriceShort(data.revenue.currentMonth)} tháng này
            </span>
          </div>
          <div className="flex items-end gap-2 h-48">
            {data.monthlyRevenue.map((item) => (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-gold/35 to-gold/80 min-h-[4px] border border-gold/10"
                  style={{
                    height: `${Math.max(4, (item.value / maxMonthRevenue) * 100)}%`,
                  }}
                  title={`${item.month}: ${formatPrice(item.value)}`}
                />
                <span className="text-[10px] text-ivory/30">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 rounded-xl bg-dark-card border border-dark-border/30">
          <h2 className="text-sm font-semibold text-ivory/80 mb-5">
            Doanh thu theo thương hiệu
          </h2>
          {data.brandRevenue.length > 0 ? (
            <div className="space-y-4">
              {data.brandRevenue.map((item) => (
                <div key={item.brand}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-xs text-ivory/60">
                      {item.brand}
                    </span>
                    <span className="text-xs text-gold">
                      {item.percent}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-dark-bg border border-dark-border/40 overflow-hidden">
                    <div
                      className="h-full bg-gold"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-ivory/28 mt-1">
                    {formatPrice(item.value)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ivory/35">
              Chưa có đơn hoàn thành để phân tích thương hiệu.
            </p>
          )}
        </section>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickMetric
          icon={Watch}
          label="Sản phẩm đang bán"
          value={data.inventory.products}
        />
        <QuickMetric
          icon={Package}
          label="Tổng tồn kho"
          value={data.inventory.stockUnits}
        />
        <QuickMetric
          icon={Star}
          label="Đánh giá chờ duyệt"
          value={data.reviews.pending}
        />
        <QuickMetric
          icon={FileText}
          label="Bài viết đã đăng"
          value={data.blogs.published}
        />
      </div>

      <section className="p-6 rounded-xl bg-dark-card border border-dark-border/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-ivory/80">
            Đơn hàng gần đây
          </h2>
          <Link
            href="/admin/don-hang"
            className="text-xs text-gold/60 hover:text-gold transition-colors"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border/20">
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="text-right py-3 px-4 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="text-center py-3 px-4 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-dark-border/10 hover:bg-white/[0.01] transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gold/80 font-mono">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-sm text-ivory/60">
                    {order.customer}
                  </td>
                  <td className="py-3 px-4 text-sm text-ivory/50">
                    {order.items[0]?.name || "Không có sản phẩm"}
                  </td>
                  <td className="py-3 px-4 text-sm text-ivory/70 text-right font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        STATUS_STYLES[order.status]
                      }`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.recentOrders.length === 0 && (
            <p className="py-10 text-center text-sm text-ivory/35">
              Chưa có đơn hàng nào.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  accent,
  inverse,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  change: number;
  accent: string;
  inverse?: boolean;
}) {
  const positive = inverse ? change <= 0 : change >= 0;

  return (
    <div className="p-5 rounded-xl bg-dark-card border border-dark-border/30 hover:border-dark-border/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${accent}`}>
          <Icon size={18} />
        </div>
        <span
          className={`flex items-center gap-0.5 text-xs font-medium ${
            positive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change > 0 ? "+" : ""}
          {change}%
        </span>
      </div>
      <p className="text-2xl font-bold text-ivory mb-1">{value}</p>
      <p className="text-xs text-ivory/40">{label}</p>
    </div>
  );
}

function QuickMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="p-4 rounded-xl bg-dark-card/50 border border-dark-border/20 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gold/[0.06]">
        <Icon size={16} className="text-gold/60" />
      </div>
      <div>
        <p className="text-lg font-bold text-ivory">
          {value.toLocaleString("vi-VN")}
        </p>
        <p className="text-[10px] text-ivory/30">{label}</p>
      </div>
    </div>
  );
}
