"use client";

import { FormEvent, useState } from "react";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/admin-store";
import type { Review, ReviewStatus } from "@/types/domain";

interface ReviewFormState {
  productId: string;
  customerId: string;
  rating: string;
  content: string;
  status: ReviewStatus;
}

export default function AdminReviewsPage() {
  const reviews = useAdminStore((state) => state.reviews);
  const products = useAdminStore((state) => state.products);
  const customers = useAdminStore((state) => state.customers);
  const addReview = useAdminStore((state) => state.addReview);
  const updateReview = useAdminStore((state) => state.updateReview);
  const deleteReview = useAdminStore((state) => state.deleteReview);
  const updateReviewStatus = useAdminStore((state) => state.updateReviewStatus);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewFormState>({
    productId: products[0]?.id ?? "",
    customerId: customers[0]?.id ?? "",
    rating: "5",
    content: "",
    status: "pending",
  });

  const resetForm = () => {
    setEditingReviewId(null);
    setForm({
      productId: products[0]?.id ?? "",
      customerId: customers[0]?.id ?? "",
      rating: "5",
      content: "",
      status: "pending",
    });
  };

  const loadReview = (review: Review) => {
    setEditingReviewId(review.id);
    setForm({
      productId: review.productId,
      customerId: review.customerId,
      rating: String(review.rating),
      content: review.content,
      status: review.status,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      productId: form.productId,
      customerId: form.customerId,
      rating: Number(form.rating || 1),
      content: form.content.trim(),
      status: form.status,
    };

    if (!payload.productId || !payload.customerId || !payload.content) return;

    if (editingReviewId) {
      updateReview(editingReviewId, payload);
    } else {
      addReview(payload);
    }

    resetForm();
  };

  const columns: AdminColumn<Review>[] = [
    { header: "San pham", cell: (review) => products.find((product) => product.id === review.productId)?.name ?? review.productId },
    { header: "Khach", cell: (review) => customers.find((customer) => customer.id === review.customerId)?.name ?? review.customerId },
    { header: "Rating", cell: (review) => <span className="font-semibold text-frost">{review.rating}/5</span> },
    { header: "Noi dung", cell: (review) => <span className="line-clamp-2">{review.content}</span> },
    { header: "Status", cell: (review) => <AdminStatusPill status={review.status} /> },
    {
      header: "Moderate",
      cell: (review) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => updateReviewStatus(review.id, "published")}>
            Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => updateReviewStatus(review.id, "hidden")}>
            Hide
          </Button>
          <Button size="sm" variant="secondary" onClick={() => loadReview(review)}>
            Sua
          </Button>
          <Button size="sm" variant="danger" onClick={() => deleteReview(review.id)}>
            Xoa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Reviews"
        title="Kiem duyet danh gia"
        description="Quan ly review pending, published va hidden voi thao tac them, sua, xoa, approve va hide."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <AdminDataTable title="Review moderation" rows={reviews} columns={columns} getRowKey={(review) => review.id} />
        <AdminActionPanel
          title={editingReviewId ? "Sua danh gia" : "Them danh gia"}
          description="Them review noi bo hoac chinh sua noi dung can moderation."
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
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Rating</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ReviewStatus }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  <option value="pending">pending</option>
                  <option value="published">published</option>
                  <option value="hidden">hidden</option>
                </select>
              </label>
            </div>
            <label>
              <span className="text-xs font-semibold uppercase text-steel">Noi dung</span>
              <textarea
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none focus:border-pulse"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="submit">{editingReviewId ? "Luu danh gia" : "Them danh gia"}</Button>
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
