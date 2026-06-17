"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { AdminShell } from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { categories } from "@/data/categories";
import { formatCurrency } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";
import type { Product, ProductBadge, ProductCategory, ProductStatus } from "@/types/domain";

const badgeOptions: ProductBadge[] = ["New", "Best fit", "Save", "Limited", "Pro pick"];

interface ProductFormState {
  sku: string;
  name: string;
  categoryId: ProductCategory;
  price: string;
  stock: string;
  status: ProductStatus;
}

const defaultProductForm: ProductFormState = {
  sku: "",
  name: "",
  categoryId: "accessory",
  price: "990000",
  stock: "5",
  status: "active",
};

export default function AdminProductsPage() {
  const products = useAdminStore((state) => state.products);
  const addProduct = useAdminStore((state) => state.addProduct);
  const updateProduct = useAdminStore((state) => state.updateProduct);
  const deleteProduct = useAdminStore((state) => state.deleteProduct);
  const updateProductStock = useAdminStore((state) => state.updateProductStock);
  const updateProductBadges = useAdminStore((state) => state.updateProductBadges);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultProductForm);
  const selectedProduct = products.find((product) => product.id === selectedId) ?? products[0];
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      if (category !== "all" && product.categoryId !== category) return false;
      if (!normalizedQuery) return true;
      return [product.name, product.sku, product.badges.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [category, products, query]);

  const resetForm = () => {
    setEditingProductId(null);
    setForm(defaultProductForm);
  };

  const loadProduct = (product: Product) => {
    setSelectedId(product.id);
    setEditingProductId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      categoryId: product.categoryId,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      status: form.status,
    };

    if (!payload.sku || !payload.name) return;

    if (editingProductId) {
      updateProduct(editingProductId, payload);
      setSelectedId(editingProductId);
    } else {
      addProduct(payload);
    }

    resetForm();
  };

  const handleDeleteSelected = () => {
    if (!selectedProduct) return;

    const nextProduct = products.find((product) => product.id !== selectedProduct.id);
    deleteProduct(selectedProduct.id);
    setSelectedId(nextProduct?.id ?? "");
    if (editingProductId === selectedProduct.id) resetForm();
  };

  const columns: AdminColumn<Product>[] = [
    {
      header: "San pham",
      cell: (product) => (
        <div>
          <button
            type="button"
            onClick={() => setSelectedId(product.id)}
            className="text-left font-semibold text-frost hover:text-pulse"
          >
            {product.name}
          </button>
          <p className="mt-1 text-xs text-steel">{product.sku}</p>
        </div>
      ),
    },
    { header: "Danh muc", cell: (product) => product.categoryId },
    {
      header: "Gia",
      cell: (product) => <span className="font-semibold text-frost">{formatCurrency(product.price)}</span>,
    },
    {
      header: "Ton",
      cell: (product) => (
        <span
          className={product.stock <= product.lowStockThreshold ? "font-semibold text-warning" : "font-semibold text-frost"}
        >
          {product.stock}
        </span>
      ),
    },
    { header: "Status", cell: (product) => <AdminStatusPill status={product.status} /> },
    {
      header: "Badges",
      cell: (product) => (
        <div className="flex flex-wrap gap-1">
          {product.badges.map((badge) => (
            <Badge key={badge} variant="neutral">
              {badge}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Hanh dong",
      cell: (product) => (
        <button type="button" onClick={() => loadProduct(product)} className="font-semibold text-pulse hover:text-frost">
          Sua
        </button>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Catalog ops"
        title="Quan ly san pham"
        description="Tim, loc, them, sua, xoa va dieu chinh nhanh status, ton kho, badge."
      />

      <section className="mb-6 grid gap-3 rounded-lg border border-line bg-panel p-4 md:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tim theo ten, SKU, badge..."
          className="min-h-11 rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none placeholder:text-steel/70 focus:border-pulse"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as ProductCategory | "all")}
          className="min-h-11 rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
        >
          <option value="all">Tat ca danh muc</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <AdminDataTable
          title="Product table"
          description={`${filteredProducts.length} san pham dang hien thi.`}
          rows={filteredProducts}
          columns={columns}
          getRowKey={(product) => product.id}
        />

        <AdminActionPanel
          title={editingProductId ? "Sua san pham" : "Them san pham"}
          description="Du lieu duoc luu trong trinh duyet cua phien ban frontend."
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label>
              <span className="text-xs font-semibold uppercase text-steel">SKU</span>
              <input
                value={form.sku}
                onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Ten san pham</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Danh muc</span>
                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, categoryId: event.target.value as ProductCategory }))
                  }
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProductStatus }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  <option value="active">active</option>
                  <option value="draft">draft</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Gia</span>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Ton kho</span>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="submit">{editingProductId ? "Luu san pham" : "Them san pham"}</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Lam moi
              </Button>
            </div>
          </form>

          {selectedProduct ? (
            <div className="mt-6 border-t border-line pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-frost">{selectedProduct.name}</p>
                <Button size="sm" variant="danger" onClick={handleDeleteSelected}>
                  Xoa
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => updateProductStock(selectedProduct.id, selectedProduct.stock - 1)}>
                  -1
                </Button>
                <Button variant="secondary" onClick={() => updateProductStock(selectedProduct.id, selectedProduct.stock + 1)}>
                  +1
                </Button>
              </div>
              <div className="mt-5">
                <span className="text-xs font-semibold uppercase text-steel">Badges</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {badgeOptions.map((badge) => {
                    const active = selectedProduct.badges.includes(badge);

                    return (
                      <button
                        key={badge}
                        type="button"
                        onClick={() =>
                          updateProductBadges(
                            selectedProduct.id,
                            active
                              ? selectedProduct.badges.filter((item) => item !== badge)
                              : [...selectedProduct.badges, badge],
                          )
                        }
                        className={`rounded-md border px-2 py-1 text-xs font-semibold transition-colors ${
                          active
                            ? "border-signal/45 bg-signal/14 text-[#B8BFFF]"
                            : "border-line bg-graphite text-steel hover:border-pulse/50 hover:text-frost"
                        }`}
                      >
                        {badge}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </AdminActionPanel>
      </div>
    </AdminShell>
  );
}
