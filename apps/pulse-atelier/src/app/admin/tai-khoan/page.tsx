"use client";

import { FormEvent, useState } from "react";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth-store";
import type { Account } from "@/data/accounts";

interface AccountFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

const defaultForm: AccountFormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
};

export default function AdminUserAccountsPage() {
  const registeredAccounts = useAuthStore((state) => state.registeredAccounts);
  const createRegisteredAccount = useAuthStore((state) => state.createRegisteredAccount);
  const updateRegisteredAccount = useAuthStore((state) => state.updateRegisteredAccount);
  const deleteRegisteredAccount = useAuthStore((state) => state.deleteRegisteredAccount);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [form, setForm] = useState<AccountFormState>(defaultForm);
  const [error, setError] = useState("");

  const resetForm = () => {
    setEditingAccountId(null);
    setForm(defaultForm);
    setError("");
  };

  const loadAccount = (account: Account) => {
    setEditingAccountId(account.id);
    setForm({
      name: account.name,
      email: account.email,
      phone: account.phone ?? "",
      address: account.address ?? "",
      password: "",
    });
    setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (editingAccountId) {
      updateRegisteredAccount(editingAccountId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password || undefined,
      });
      resetForm();
      return;
    }

    const result = createRegisteredAccount({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      password: form.password,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    resetForm();
  };

  const columns: AdminColumn<Account>[] = [
    {
      header: "Nguoi dung",
      cell: (account) => (
        <div>
          <p className="font-semibold text-frost">{account.name}</p>
          <p className="mt-1 text-xs text-steel">{account.email}</p>
        </div>
      ),
    },
    { header: "Dien thoai", cell: (account) => account.phone || "Chua cap nhat" },
    { header: "Dia chi", cell: (account) => account.address || "Chua cap nhat" },
    {
      header: "Role",
      cell: (account) => <Badge variant="neutral">{account.role}</Badge>,
    },
    {
      header: "Ngay tao",
      cell: (account) => account.createdAt ? new Date(account.createdAt).toLocaleDateString("vi-VN") : "Local",
    },
    {
      header: "Hanh dong",
      cell: (account) => (
        <div className="flex gap-3">
          <button type="button" onClick={() => loadAccount(account)} className="font-semibold text-pulse hover:text-frost">
            Sua
          </button>
          <button
            type="button"
            onClick={() => deleteRegisteredAccount(account.id)}
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
        eyebrow="User accounts"
        title="Quan ly tai khoan nguoi dung"
        description="Them, sua va xoa cac tai khoan nguoi dung dang ky tren storefront."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <AdminDataTable
          title="Tai khoan nguoi dung"
          description={`${registeredAccounts.length} tai khoan da dang ky.`}
          rows={registeredAccounts.filter((account) => account.role === "user")}
          columns={columns}
          getRowKey={(account) => account.id}
          emptyText="Chua co tai khoan nguoi dung nao."
        />

        <AdminActionPanel
          title={editingAccountId ? "Sua tai khoan" : "Them tai khoan"}
          description="Trang nay chi quan ly tai khoan nguoi dung thuong."
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Ho ten</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Dien thoai</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Dia chi</span>
              <textarea
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">
                {editingAccountId ? "Mat khau moi" : "Mat khau"}
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>

            {error ? <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}

            <div className="grid grid-cols-2 gap-2">
              <Button type="submit">{editingAccountId ? "Luu tai khoan" : "Them tai khoan"}</Button>
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
