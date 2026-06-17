"use client";

import { FormEvent, useState } from "react";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/admin-store";
import type { Coupon, CouponType } from "@/types/domain";

interface CouponFormState {
  code: string;
  type: CouponType;
  value: string;
  usageLimit: string;
  active: boolean;
}

const defaultCouponForm: CouponFormState = {
  code: "",
  type: "percent",
  value: "10",
  usageLimit: "50",
  active: true,
};

export default function AdminCouponsPage() {
  const coupons = useAdminStore((state) => state.coupons);
  const addCoupon = useAdminStore((state) => state.addCoupon);
  const updateCoupon = useAdminStore((state) => state.updateCoupon);
  const deleteCoupon = useAdminStore((state) => state.deleteCoupon);
  const toggleCoupon = useAdminStore((state) => state.toggleCoupon);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormState>(defaultCouponForm);

  const resetForm = () => {
    setEditingCouponId(null);
    setForm(defaultCouponForm);
  };

  const loadCoupon = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      usageLimit: String(coupon.usageLimit),
      active: coupon.active,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value || 0),
      usageLimit: Number(form.usageLimit || 0),
      active: form.active,
    };

    if (!payload.code) return;

    if (editingCouponId) {
      updateCoupon(editingCouponId, payload);
    } else {
      addCoupon(payload);
    }

    resetForm();
  };

  const columns: AdminColumn<Coupon>[] = [
    { header: "Code", cell: (coupon) => <span className="font-semibold text-frost">{coupon.code}</span> },
    { header: "Loai", cell: (coupon) => coupon.type },
    {
      header: "Gia tri",
      cell: (coupon) => (coupon.type === "percent" ? `${coupon.value}%` : `${coupon.value.toLocaleString("vi-VN")} VND`),
    },
    { header: "Usage", cell: (coupon) => `${coupon.usageCount}/${coupon.usageLimit}` },
    {
      header: "Status",
      cell: (coupon) => <Badge variant={coupon.active ? "mint" : "danger"}>{coupon.active ? "active" : "inactive"}</Badge>,
    },
    {
      header: "Action",
      cell: (coupon) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => toggleCoupon(coupon.id)}>
            {coupon.active ? "Tat" : "Bat"}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => loadCoupon(coupon)}>
            Sua
          </Button>
          <Button size="sm" variant="danger" onClick={() => deleteCoupon(coupon.id)}>
            Xoa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Promotions"
        title="Ma giam gia"
        description="Quan ly coupon, gioi han su dung va trang thai active cua tung chuong trinh uu dai."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <AdminDataTable title="Coupon table" rows={coupons} columns={columns} getRowKey={(coupon) => coupon.id} />
        <AdminActionPanel
          title={editingCouponId ? "Sua ma giam gia" : "Them ma giam gia"}
          description="Ma giam gia duoc luu trong store admin tren trinh duyet."
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Code</span>
              <input
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Loai</span>
                <select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as CouponType }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  <option value="percent">percent</option>
                  <option value="fixed">fixed</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Gia tri</span>
                <input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
            </div>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Gioi han su dung</span>
              <input
                type="number"
                min={0}
                value={form.usageLimit}
                onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-line bg-graphite p-3 text-sm font-semibold text-frost">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                className="h-4 w-4 accent-pulse"
              />
              Active
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="submit">{editingCouponId ? "Luu ma" : "Them ma"}</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Lam moi
              </Button>
            </div>
          </form>
        </AdminActionPanel>
      </div>
    </AdminShell>
  );
}
