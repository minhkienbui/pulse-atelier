import Image from "next/image";
import { connection } from "next/server";
import { Fragment } from "react";
import { Package, Search, Star, Watch, X } from "lucide-react";
import {
  createAdminProductAction,
  setAdminProductActiveAction,
  updateAdminProductAction,
} from "@/app/actions/admin-products";
import { getAdminProductsPageData, type AdminProductDto } from "@/data/admin";
import { formatPrice } from "@/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await connection();
  const params = (await searchParams) || {};
  const data = await getAdminProductsPageData({
    q: firstParam(params, "q"),
    brandId: firstParam(params, "brandId"),
    categoryId: firstParam(params, "categoryId"),
  });
  const canCreate = data.brands.length > 0 && data.categories.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="heading-serif text-2xl text-ivory">
            Quản lý sản phẩm
          </h1>
          <p className="text-xs text-ivory/40">
            Đồng hồ thật trong database, dùng trực tiếp cho catalog và checkout.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          label="Tổng sản phẩm"
          value={data.total}
          icon={Watch}
          color="text-gold bg-gold/5 border-gold/10"
        />
        <Metric
          label="Sản phẩm nổi bật"
          value={data.featuredCount}
          icon={Star}
          color="text-amber-400 bg-amber-400/5 border-amber-400/10"
        />
        <Metric
          label="Tồn kho thấp"
          value={data.lowStockCount}
          icon={Package}
          color="text-yellow-400 bg-yellow-400/5 border-yellow-400/10"
        />
        <Metric
          label="Đã hết hàng"
          value={data.outOfStockCount}
          icon={X}
          color="text-red-400 bg-red-400/5 border-red-400/10"
        />
      </div>

      <details className="rounded-xl bg-dark-card border border-dark-border/30 overflow-hidden">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-gold hover:bg-white/[0.02]">
          Thêm sản phẩm mới
        </summary>
        <div className="border-t border-dark-border/20 p-5">
          {canCreate ? (
            <ProductForm
              action={createAdminProductAction}
              brands={data.brands}
              categories={data.categories}
              submitLabel="Tạo sản phẩm"
            />
          ) : (
            <p className="text-sm text-ivory/40">
              Cần có ít nhất một thương hiệu và một danh mục đang hoạt động
              trước khi thêm sản phẩm.
            </p>
          )}
        </div>
      </details>

      <form
        action="/admin/san-pham"
        className="p-4 rounded-xl bg-dark-card border border-dark-border/30 flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full md:w-96">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
          />
          <input
            name="q"
            defaultValue={data.filters.q || ""}
            placeholder="Tìm theo tên sản phẩm, SKU, thương hiệu..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <select
            name="brandId"
            defaultValue={data.filters.brandId || ""}
            className="px-3 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory/70 focus:border-gold/40 cursor-pointer"
          >
            <option value="">Tất cả thương hiệu</option>
            {data.brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select
            name="categoryId"
            defaultValue={data.filters.categoryId || ""}
            className="px-3 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory/70 focus:border-gold/40 cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
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
                <th className="py-3 px-4">Đồng hồ</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Thương hiệu</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4 text-right">Giá bán</th>
                <th className="py-3 px-4 text-center">Tồn kho</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Quản lý</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <Fragment key={product.id}>
                  <tr
                    className="border-b border-dark-border/10 hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-watch-dial border border-dark-border/20 shrink-0">
                          <Image
                            src={product.images[0] || "/file.svg"}
                            alt={product.name}
                            fill
                            className="object-contain p-1.5"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-ivory/80 truncate max-w-[220px]">
                            {product.name}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {product.isLimited && (
                              <span className="text-[9px] text-red-400 font-medium">
                                Limited
                              </span>
                            )}
                            {product.isFeatured && (
                              <span className="text-[9px] text-amber-400 font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-ivory/40">
                      {product.sku}
                    </td>
                    <td className="py-4 px-4 text-xs text-ivory/60">
                      {product.brand.name}
                    </td>
                    <td className="py-4 px-4 text-xs text-ivory/60">
                      {product.category.name}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-gold text-right">
                      {formatPrice(product.price)}
                      {product.originalPrice && (
                        <span className="block text-[9px] text-ivory/20 line-through mt-0.5">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          product.stock === 0
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : product.stock < 3
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {product.stock === 0 ? "Hết hàng" : `Tồn: ${product.stock}`}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          product.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-ivory/5 text-ivory/35 border-ivory/10"
                        }`}
                      >
                        {product.isActive ? "Đang bán" : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <form action={setAdminProductActiveAction}>
                          <input
                            type="hidden"
                            name="productId"
                            value={product.id}
                          />
                          <input
                            type="hidden"
                            name="isActive"
                            value={product.isActive ? "false" : "true"}
                          />
                          <button className="px-3 py-1.5 rounded-lg border border-dark-border text-ivory/45 hover:text-ivory text-[10px] uppercase font-semibold">
                            {product.isActive ? "Ẩn" : "Hiện"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-dark-border/20">
                    <td colSpan={8} className="px-4 pb-5">
                      <details className="rounded-lg bg-dark-bg/45 border border-dark-border/20">
                        <summary className="cursor-pointer px-4 py-3 text-xs text-ivory/45 hover:text-gold">
                          Chỉnh sửa chi tiết: {product.name}
                        </summary>
                        <div className="border-t border-dark-border/20 p-4">
                          <ProductForm
                            product={product}
                            action={updateAdminProductAction}
                            brands={data.brands}
                            categories={data.categories}
                            submitLabel="Lưu thay đổi"
                          />
                        </div>
                      </details>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
          {data.products.length === 0 && (
            <div className="py-16 text-center">
              <h2 className="heading-serif text-2xl text-ivory">
                Không tìm thấy sản phẩm
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

function ProductForm({
  product,
  action,
  brands,
  categories,
  submitLabel,
}: {
  product?: AdminProductDto;
  action: (formData: FormData) => void | Promise<void>;
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4 text-xs">
      {product && <input type="hidden" name="productId" value={product.id} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Tên đồng hồ">
          <input
            name="name"
            required
            defaultValue={product?.name || ""}
            className="admin-input"
            placeholder="Rolex Datejust 36mm"
          />
        </Field>
        <Field label="SKU">
          <input
            name="sku"
            required
            defaultValue={product?.sku || ""}
            className="admin-input font-mono"
            placeholder="RLX-DJ-36"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Thương hiệu">
          <select
            name="brandId"
            required
            defaultValue={product?.brandId || brands[0]?.id}
            className="admin-input"
          >
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Danh mục">
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId || categories[0]?.id}
            className="admin-input"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Field label="Giá bán">
          <input
            name="price"
            type="number"
            min="0"
            required
            defaultValue={product?.price || ""}
            className="admin-input"
          />
        </Field>
        <Field label="Giá niêm yết">
          <input
            name="originalPrice"
            type="number"
            min="0"
            defaultValue={product?.originalPrice || ""}
            className="admin-input"
          />
        </Field>
        <Field label="Tồn kho">
          <input
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={product?.stock ?? 0}
            className="admin-input"
          />
        </Field>
        <Field label="Bảo hành năm">
          <input
            name="warranty"
            type="number"
            min="0"
            defaultValue={product?.warranty || ""}
            className="admin-input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Bộ máy">
          <input
            name="movement"
            defaultValue={product?.movement || ""}
            className="admin-input"
            placeholder="Automatic"
          />
        </Field>
        <Field label="Kích cỡ vỏ">
          <input
            name="caseSize"
            defaultValue={product?.caseSize || ""}
            className="admin-input"
            placeholder="41mm"
          />
        </Field>
        <Field label="Chất liệu vỏ">
          <input
            name="caseMaterial"
            defaultValue={product?.caseMaterial || ""}
            className="admin-input"
          />
        </Field>
        <Field label="Màu mặt">
          <input
            name="dialColor"
            defaultValue={product?.dialColor || ""}
            className="admin-input"
          />
        </Field>
        <Field label="Dây đeo">
          <input
            name="strapMaterial"
            defaultValue={product?.strapMaterial || ""}
            className="admin-input"
          />
        </Field>
        <Field label="Kháng nước">
          <input
            name="waterResistance"
            defaultValue={product?.waterResistance || ""}
            className="admin-input"
          />
        </Field>
      </div>

      <Field label="Ảnh chính">
        <input
          name="image"
          defaultValue={product?.images[0] || ""}
          className="admin-input"
          placeholder="https://images.unsplash.com/photo-..."
        />
      </Field>

      <Field label="Mô tả">
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description || ""}
          className="admin-input resize-none"
        />
      </Field>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-ivory/65">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={product?.isFeatured || false}
          />
          Sản phẩm nổi bật
        </label>
        <label className="flex items-center gap-2 text-ivory/65">
          <input
            name="isLimited"
            type="checkbox"
            defaultChecked={product?.isLimited || false}
          />
          Phiên bản giới hạn
        </label>
      </div>

      <button type="submit" className="btn-gold px-5 py-2.5 text-[11px]">
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-ivory/40 font-medium">{label}</span>
      {children}
    </label>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-xl border ${color} flex items-center gap-3`}>
      <div className="p-2 rounded-lg bg-black/40">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-bold text-ivory">
          {value.toLocaleString("vi-VN")}
        </p>
        <p className="text-[10px] text-ivory/40 uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );
}
