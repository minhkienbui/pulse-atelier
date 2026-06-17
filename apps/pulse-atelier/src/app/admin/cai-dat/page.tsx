"use client";

import { FormEvent, useState } from "react";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/admin-store";

interface SettingsFormState {
  storeName: string;
  shippingFee: string;
  returnPolicy: string;
  warrantyCopy: string;
}

function toFormState(settings: ReturnType<typeof useAdminStore.getState>["settings"]): SettingsFormState {
  return {
    storeName: settings.storeName,
    shippingFee: String(settings.shippingFee),
    returnPolicy: settings.returnPolicy,
    warrantyCopy: settings.warrantyCopy,
  };
}

export default function AdminSettingsPage() {
  const settings = useAdminStore((state) => state.settings);
  const updateSettings = useAdminStore((state) => state.updateSettings);
  const reset = useAdminStore((state) => state.reset);
  const [form, setForm] = useState<SettingsFormState>(() => toFormState(settings));
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings({
      storeName: form.storeName.trim() || "Pulse Atelier",
      shippingFee: Number(form.shippingFee || 0),
      returnPolicy: form.returnPolicy.trim(),
      warrantyCopy: form.warrantyCopy.trim(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const handleReset = () => {
    reset();
    setForm(toFormState(useAdminStore.getState().settings));
    setSaved(false);
  };

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Settings"
        title="Cai dat cua hang"
        description="Quan ly store profile, phi ship, chinh sach doi tra, bao hanh va nhan phuong thuc thanh toan."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.78fr]">
        <AdminActionPanel title="Store profile" description="Cac thay doi duoc luu trong localStorage cua trinh duyet.">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Ten cua hang</span>
              <input
                value={form.storeName}
                onChange={(event) => setForm((current) => ({ ...current, storeName: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Phi van chuyen mac dinh</span>
              <input
                type="number"
                min={0}
                value={form.shippingFee}
                onChange={(event) => setForm((current) => ({ ...current, shippingFee: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Chinh sach doi tra</span>
              <textarea
                value={form.returnPolicy}
                onChange={(event) => setForm((current) => ({ ...current, returnPolicy: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Bao hanh</span>
              <textarea
                value={form.warrantyCopy}
                onChange={(event) => setForm((current) => ({ ...current, warrantyCopy: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="submit">{saved ? "Da luu" : "Luu cai dat"}</Button>
              <Button type="button" variant="secondary" onClick={handleReset}>
                Dat lai mac dinh
              </Button>
            </div>
          </form>
        </AdminActionPanel>

        <section className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-lg font-semibold text-frost">Payment method labels</h2>
          <div className="mt-5 space-y-3">
            {settings.paymentLabels.map((label) => (
              <div key={label} className="rounded-lg border border-line bg-graphite p-4 text-sm font-semibold text-frost">
                {label}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-pulse/25 bg-pulse/10 p-4 text-sm leading-6 text-steel">
            {settings.storeName} dang dung phi ship {settings.shippingFee.toLocaleString("vi-VN")} VND cho don hang
            duoi nguong mien phi.
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
