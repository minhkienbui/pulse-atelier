"use client";

import { FormEvent, useState } from "react";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/admin-store";
import type { SupportTicket, TicketStatus } from "@/types/domain";

const statuses: TicketStatus[] = ["open", "in-progress", "resolved"];

interface TicketFormState {
  customerId: string;
  productId: string;
  subject: string;
  priority: SupportTicket["priority"];
  assignedTo: string;
  status: TicketStatus;
}

export default function AdminSupportPage() {
  const tickets = useAdminStore((state) => state.tickets);
  const customers = useAdminStore((state) => state.customers);
  const products = useAdminStore((state) => state.products);
  const addTicket = useAdminStore((state) => state.addTicket);
  const updateTicket = useAdminStore((state) => state.updateTicket);
  const deleteTicket = useAdminStore((state) => state.deleteTicket);
  const updateTicketStatus = useAdminStore((state) => state.updateTicketStatus);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [form, setForm] = useState<TicketFormState>({
    customerId: customers[0]?.id ?? "",
    productId: "",
    subject: "",
    priority: "medium",
    assignedTo: "Nhi",
    status: "open",
  });

  const resetForm = () => {
    setEditingTicketId(null);
    setForm({
      customerId: customers[0]?.id ?? "",
      productId: "",
      subject: "",
      priority: "medium",
      assignedTo: "Nhi",
      status: "open",
    });
  };

  const loadTicket = (ticket: SupportTicket) => {
    setEditingTicketId(ticket.id);
    setForm({
      customerId: ticket.customerId,
      productId: ticket.productId ?? "",
      subject: ticket.subject,
      priority: ticket.priority,
      assignedTo: ticket.assignedTo,
      status: ticket.status,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      customerId: form.customerId,
      productId: form.productId || undefined,
      subject: form.subject.trim(),
      priority: form.priority,
      assignedTo: form.assignedTo.trim(),
      status: form.status,
    };

    if (!payload.customerId || !payload.subject || !payload.assignedTo) return;

    if (editingTicketId) {
      updateTicket(editingTicketId, payload);
    } else {
      addTicket(payload);
    }

    resetForm();
  };

  const columns: AdminColumn<SupportTicket>[] = [
    { header: "Ticket", cell: (ticket) => <span className="font-semibold text-frost">{ticket.id}</span> },
    { header: "Khach", cell: (ticket) => customers.find((customer) => customer.id === ticket.customerId)?.name ?? ticket.customerId },
    {
      header: "San pham",
      cell: (ticket) =>
        ticket.productId ? products.find((product) => product.id === ticket.productId)?.name ?? ticket.productId : "Tai khoan",
    },
    { header: "Chu de", cell: (ticket) => ticket.subject },
    { header: "Priority", cell: (ticket) => ticket.priority },
    { header: "Status", cell: (ticket) => <AdminStatusPill status={ticket.status} /> },
    {
      header: "Action",
      cell: (ticket) => (
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={ticket.status === status ? "primary" : "secondary"}
              onClick={() => updateTicketStatus(ticket.id, status)}
            >
              {status}
            </Button>
          ))}
          <Button size="sm" variant="secondary" onClick={() => loadTicket(ticket)}>
            Sua
          </Button>
          <Button size="sm" variant="danger" onClick={() => deleteTicket(ticket.id)}>
            Xoa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Support"
        title="Ho tro va bao hanh"
        description="Quan ly hang doi ticket, uu tien, nguoi phu trach va trang thai xu ly."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <AdminDataTable title="Support tickets" rows={tickets} columns={columns} getRowKey={(ticket) => ticket.id} />
        <AdminActionPanel
          title={editingTicketId ? "Sua ticket" : "Them ticket"}
          description="Gan ticket cho khach hang, san pham lien quan va nguoi phu trach."
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Khach hang</span>
              <select
                value={form.customerId}
                onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">San pham</span>
              <select
                value={form.productId}
                onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              >
                <option value="">Tai khoan</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Chu de</span>
              <input
                value={form.subject}
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, priority: event.target.value as SupportTicket["priority"] }))
                  }
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TicketStatus }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Nguoi phu trach</span>
              <input
                value={form.assignedTo}
                onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="submit">{editingTicketId ? "Luu ticket" : "Them ticket"}</Button>
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
