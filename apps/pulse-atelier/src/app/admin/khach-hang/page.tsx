"use client";

import { FormEvent, useState } from "react";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";
import { useAuthStore } from "@/stores/auth-store";
import type { Customer } from "@/types/domain";

interface CustomerFormState {
  name: string;
  email: string;
  phone: string;
  segment: Customer["segment"];
  address: string;
}

const defaultCustomerForm: CustomerFormState = {
  name: "",
  email: "",
  phone: "",
  segment: "New",
  address: "",
};

export default function AdminCustomersPage() {
  const customers = useAdminStore((state) => state.customers);
  const orders = useAdminStore((state) => state.orders);
  const tickets = useAdminStore((state) => state.tickets);
  const addCustomer = useAdminStore((state) => state.addCustomer);
  const updateCustomer = useAdminStore((state) => state.updateCustomer);
  const deleteCustomer = useAdminStore((state) => state.deleteCustomer);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerFormState>(defaultCustomerForm);

  const resetForm = () => {
    setEditingCustomerId(null);
    setForm(defaultCustomerForm);
  };

  const loadCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      segment: customer.segment,
      address: customer.address,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      segment: form.segment,
      address: form.address.trim(),
    };

    if (!payload.name || !payload.email) return;

    if (editingCustomerId) {
      updateCustomer(editingCustomerId, payload);
      const accounts = useAuthStore.getState().registeredAccounts;
      const matchedAccount = accounts.find((acc) => acc.customerId === editingCustomerId);
      if (matchedAccount) {
        useAuthStore.getState().updateRegisteredAccount(matchedAccount.id, {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
        });
      }
    } else {
      addCustomer(payload);
    }

    resetForm();
  };

  const columns: AdminColumn<Customer>[] = [
    {
      header: "Khach hang",
      cell: (customer) => (
        <div>
          <p className="font-semibold text-frost">{customer.name}</p>
          <p className="mt-1 text-xs text-steel">{customer.email}</p>
        </div>
      ),
    },
    {
      header: "Segment",
      cell: (customer) => <Badge variant={customer.segment === "VIP" ? "violet" : "neutral"}>{customer.segment}</Badge>,
    },
    {
      header: "Lifetime",
      cell: (customer) => <span className="font-semibold text-frost">{formatCurrency(customer.lifetimeSpend)}</span>,
    },
    { header: "Orders", cell: (customer) => orders.filter((order) => order.customerId === customer.id).length },
    { header: "Wishlist", cell: (customer) => customer.wishlistProductIds.length },
    { header: "Support", cell: (customer) => tickets.filter((ticket) => ticket.customerId === customer.id).length },
    { header: "Dien thoai", cell: (customer) => customer.phone },
    {
      header: "Hanh dong",
      cell: (customer) => (
        <div className="flex gap-3">
          <button type="button" onClick={() => loadCustomer(customer)} className="font-semibold text-pulse hover:text-frost">
            Sua
          </button>
          <button
            type="button"
            onClick={() => {
              deleteCustomer(customer.id);
              const accounts = useAuthStore.getState().registeredAccounts;
              const matchedAccount = accounts.find((acc) => acc.customerId === customer.id);
              if (matchedAccount) {
                useAuthStore.getState().deleteRegisteredAccount(matchedAccount.id);
              }
            }}
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
        eyebrow="Customers"
        title="Ho so khach hang"
        description="Quan ly khach hang voi segment, chi tieu tich luy, so don, wishlist va support count."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <AdminDataTable
          title="Customer table"
          rows={customers}
          columns={columns}
          getRowKey={(customer) => customer.id}
        />

        <AdminActionPanel
          title={editingCustomerId ? "Sua khach hang" : "Them khach hang"}
          description="Ho so khach hang duoc luu trong localStorage cua trinh duyet."
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Ten khach</span>
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
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Dien thoai</span>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Segment</span>
                <select
                  value={form.segment}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, segment: event.target.value as Customer["segment"] }))
                  }
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  <option value="New">New</option>
                  <option value="Loyal">Loyal</option>
                  <option value="VIP">VIP</option>
                </select>
              </label>
            </div>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Dia chi</span>
              <textarea
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="submit">{editingCustomerId ? "Luu khach hang" : "Them khach hang"}</Button>
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
