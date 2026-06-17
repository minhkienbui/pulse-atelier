"use client";

import { FormEvent, useState } from "react";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/admin-store";
import type { InventoryMovement, Product } from "@/types/domain";

interface MovementFormState {
  productId: string;
  type: InventoryMovement["type"];
  quantity: string;
  reason: string;
}

export default function AdminInventoryPage() {
  const products = useAdminStore((state) => state.products);
  const inventoryMovements = useAdminStore((state) => state.inventoryMovements);
  const addInventoryMovement = useAdminStore((state) => state.addInventoryMovement);
  const updateInventoryMovement = useAdminStore((state) => state.updateInventoryMovement);
  const deleteInventoryMovement = useAdminStore((state) => state.deleteInventoryMovement);
  const [editingMovementId, setEditingMovementId] = useState<string | null>(null);
  const [form, setForm] = useState<MovementFormState>({
    productId: products[0]?.id ?? "",
    type: "in",
    quantity: "1",
    reason: "",
  });

  const resetForm = () => {
    setEditingMovementId(null);
    setForm({ productId: products[0]?.id ?? "", type: "in", quantity: "1", reason: "" });
  };

  const loadMovement = (movement: InventoryMovement) => {
    setEditingMovementId(movement.id);
    setForm({
      productId: movement.productId,
      type: movement.type,
      quantity: String(movement.quantity),
      reason: movement.reason,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      productId: form.productId,
      type: form.type,
      quantity: Number(form.quantity || 0),
      reason: form.reason.trim(),
    };

    if (!payload.productId || !payload.reason) return;

    if (editingMovementId) {
      updateInventoryMovement(editingMovementId, payload);
    } else {
      addInventoryMovement(payload);
    }

    resetForm();
  };

  const productColumns: AdminColumn<Product>[] = [
    { header: "SKU", cell: (product) => <span className="font-semibold text-frost">{product.sku}</span> },
    { header: "San pham", cell: (product) => product.name },
    { header: "Ton", cell: (product) => <span className="font-semibold text-frost">{product.stock}</span> },
    { header: "Nguong", cell: (product) => product.lowStockThreshold },
    {
      header: "Trang thai",
      cell: (product) => (
        <Badge variant={product.stock <= product.lowStockThreshold ? "warning" : "mint"}>
          {product.stock <= product.lowStockThreshold ? "Can nhap" : "On dinh"}
        </Badge>
      ),
    },
  ];
  const movementColumns: AdminColumn<InventoryMovement>[] = [
    { header: "Ma", cell: (movement) => <span className="font-semibold text-frost">{movement.id}</span> },
    {
      header: "San pham",
      cell: (movement) => products.find((product) => product.id === movement.productId)?.name ?? movement.productId,
    },
    {
      header: "Loai",
      cell: (movement) => <Badge variant={movement.type === "out" ? "warning" : "neutral"}>{movement.type}</Badge>,
    },
    { header: "SL", cell: (movement) => movement.quantity },
    { header: "Ly do", cell: (movement) => movement.reason },
    { header: "Ngay", cell: (movement) => new Date(movement.createdAt).toLocaleDateString("vi-VN") },
    {
      header: "Hanh dong",
      cell: (movement) => (
        <div className="flex gap-3">
          <button type="button" onClick={() => loadMovement(movement)} className="font-semibold text-pulse hover:text-frost">
            Sua
          </button>
          <button
            type="button"
            onClick={() => deleteInventoryMovement(movement.id)}
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
        eyebrow="Inventory"
        title="Quan ly kho"
        description="Bang ton kho theo SKU va feed bien dong nhap, xuat, dieu chinh."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="grid gap-6">
          <AdminDataTable title="Stock table" rows={products} columns={productColumns} getRowKey={(product) => product.id} />
          <AdminDataTable
            title="Inventory movement feed"
            rows={inventoryMovements}
            columns={movementColumns}
            getRowKey={(movement) => movement.id}
          />
        </div>
        <AdminActionPanel
          title={editingMovementId ? "Sua bien dong kho" : "Them bien dong kho"}
          description="Ghi nhan nhap, xuat hoac dieu chinh ton kho."
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label>
              <span className="text-xs font-semibold uppercase text-steel">San pham</span>
              <select
                value={form.productId}
                onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Loai</span>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, type: event.target.value as InventoryMovement["type"] }))
                  }
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  <option value="in">in</option>
                  <option value="out">out</option>
                  <option value="adjustment">adjustment</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">So luong</span>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
            </div>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Ly do</span>
              <textarea
                value={form.reason}
                onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="submit">{editingMovementId ? "Luu bien dong" : "Them bien dong"}</Button>
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
