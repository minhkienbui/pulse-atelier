import { connection } from "next/server";
import { Search, Tags } from "lucide-react";
import {
  createAdminBrandAction,
  setAdminBrandActiveAction,
  updateAdminBrandAction,
} from "@/app/actions/admin-taxonomy";
import { getAdminBrandsPageData, type AdminBrandDto } from "@/data/admin";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await connection();
  const params = (await searchParams) || {};
  const data = await getAdminBrandsPageData({
    q: firstParam(params, "q"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-serif text-2xl text-ivory">
          Quản lý thương hiệu
        </h1>
        <p className="text-xs text-ivory/40">
          Dữ liệu thương hiệu thật dùng cho sản phẩm và trang khách hàng.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Metric label="Tổng thương hiệu" value={data.total} />
        <Metric label="Đang hoạt động" value={data.activeCount} />
        <Metric
          label="Đang ẩn"
          value={Math.max(0, data.total - data.activeCount)}
        />
      </div>

      <details className="rounded-xl bg-dark-card border border-dark-border/30 overflow-hidden">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-gold hover:bg-white/[0.02]">
          Thêm thương hiệu
        </summary>
        <div className="border-t border-dark-border/20 p-5">
          <BrandForm action={createAdminBrandAction} submitLabel="Tạo thương hiệu" />
        </div>
      </details>

      <form
        action="/admin/thuong-hieu"
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
            placeholder="Tìm theo tên, slug, quốc gia..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20"
          />
        </div>
        <button type="submit" className="btn-gold px-4 py-2 text-[11px]">
          Lọc
        </button>
      </form>

      <section className="p-6 rounded-xl bg-dark-card border border-dark-border/30">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {data.brands.map((brand) => (
            <article
              key={brand.id}
              className="border border-dark-border/25 bg-dark-bg/35 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0">
                    <Tags size={18} className="text-gold" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-ivory">
                      {brand.name}
                    </h2>
                    <p className="text-[11px] text-ivory/35 mt-1">
                      /{brand.slug}
                    </p>
                    <p className="text-xs text-ivory/45 mt-2 line-clamp-2">
                      {brand.description || "Chưa có mô tả."}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    brand.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-ivory/5 text-ivory/35 border-ivory/10"
                  }`}
                >
                  {brand.isActive ? "Hoạt động" : "Đã ẩn"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4 text-xs">
                <Info label="Quốc gia" value={brand.country || "-"} />
                <Info
                  label="Thành lập"
                  value={brand.foundedYear?.toString() || "-"}
                />
                <Info label="Sản phẩm" value={brand.watchCount.toString()} />
              </div>

              <details className="rounded-lg border border-dark-border/20 bg-black/20">
                <summary className="cursor-pointer px-4 py-3 text-xs text-ivory/45 hover:text-gold">
                  Chỉnh sửa {brand.name}
                </summary>
                <div className="border-t border-dark-border/20 p-4">
                  <BrandForm
                    brand={brand}
                    action={updateAdminBrandAction}
                    submitLabel="Lưu thay đổi"
                  />
                </div>
              </details>

              <form action={setAdminBrandActiveAction} className="mt-3">
                <input type="hidden" name="brandId" value={brand.id} />
                <input
                  type="hidden"
                  name="isActive"
                  value={brand.isActive ? "false" : "true"}
                />
                <button className="text-[10px] uppercase font-semibold text-ivory/45 hover:text-gold">
                  {brand.isActive ? "Ẩn thương hiệu" : "Hiện thương hiệu"}
                </button>
              </form>
            </article>
          ))}
        </div>
        {data.brands.length === 0 && (
          <p className="py-12 text-center text-sm text-ivory/35">
            Không tìm thấy thương hiệu.
          </p>
        )}
      </section>
    </div>
  );
}

function BrandForm({
  brand,
  action,
  submitLabel,
}: {
  brand?: AdminBrandDto;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
      {brand && <input type="hidden" name="brandId" value={brand.id} />}
      <Field label="Tên thương hiệu">
        <input name="name" required defaultValue={brand?.name || ""} className="admin-input" />
      </Field>
      <Field label="Slug">
        <input name="slug" defaultValue={brand?.slug || ""} className="admin-input" />
      </Field>
      <Field label="Quốc gia">
        <input name="country" defaultValue={brand?.country || ""} className="admin-input" />
      </Field>
      <Field label="Năm thành lập">
        <input
          name="foundedYear"
          type="number"
          min="0"
          defaultValue={brand?.foundedYear || ""}
          className="admin-input"
        />
      </Field>
      <Field label="Logo URL">
        <input name="logo" defaultValue={brand?.logo || ""} className="admin-input" />
      </Field>
      <Field label="Mô tả">
        <textarea
          name="description"
          rows={3}
          defaultValue={brand?.description || ""}
          className="admin-input resize-none"
        />
      </Field>
      <div className="sm:col-span-2">
        <button type="submit" className="btn-gold px-5 py-2.5 text-[11px]">
          {submitLabel}
        </button>
      </div>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ivory/25">
        {label}
      </p>
      <p className="text-ivory/70 mt-1">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-gold/10 bg-gold/5">
      <p className="text-lg font-bold text-ivory">
        {value.toLocaleString("vi-VN")}
      </p>
      <p className="text-[10px] text-ivory/40 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
