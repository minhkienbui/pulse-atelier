"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { formatCurrency } from "@/lib/utils";
import { useOrderStore } from "@/stores/order-store";
import { useAdminStore } from "@/stores/admin-store";
import { verifyVnpayResponseAction } from "@/lib/vnpay-actions";

function VnpayReturnContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "invalid">("loading");
  const [details, setDetails] = useState({ orderNumber: "", amount: 0 });

  useEffect(() => {
    async function verify() {
      const queryParamsString = searchParams.toString();
      if (!queryParamsString) {
        setStatus("invalid");
        return;
      }

      const res = await verifyVnpayResponseAction(queryParamsString);
      if (res.ok) {
        if (!res.isValid) {
          setStatus("invalid");
        } else if (res.responseCode === "00") {
          setDetails({ orderNumber: res.orderNumber, amount: res.amount });

          // Mark order as paid in stores
          const orderId = `order-${res.orderNumber.toLowerCase()}`;
          useOrderStore.getState().updateOrder(orderId, { paymentStatus: "paid", status: "confirmed" });
          useAdminStore.getState().updateOrder(orderId, { paymentStatus: "paid", status: "confirmed" });

          setStatus("success");
        } else {
          setDetails({ orderNumber: res.orderNumber, amount: res.amount });
          setStatus("failed");
        }
      } else {
        setStatus("invalid");
      }
    }
    verify();
  }, [searchParams]);

  return (
    <div className="max-w-md w-full rounded-lg border border-line bg-panel p-6 text-center">
      {status === "loading" ? (
        <div className="py-8">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pulse border-t-transparent"></div>
          <h2 className="mt-5 text-xl font-semibold text-frost">Dang xac thuc thanh toan...</h2>
          <p className="mt-2 text-sm text-steel">Vui long khong tat trinh duyet.</p>
        </div>
      ) : status === "success" ? (
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pulse/12 text-pulse">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-frost">Thanh toan thanh cong!</h2>
          <p className="mt-3 text-sm leading-6 text-steel">
            Don hang {details.orderNumber} da duoc thanh toan va xac nhan qua cong VNPAY.
          </p>
          <div className="mt-5 rounded-lg border border-line bg-graphite p-4 text-left text-sm text-steel">
            <div className="flex justify-between">
              <span>Ma don hang</span>
              <span className="font-semibold text-frost">{details.orderNumber}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>So tien</span>
              <span className="font-semibold text-pulse">{formatCurrency(details.amount)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Trang thai</span>
              <span className="font-semibold text-frost">Da thanh toan (VNPAY)</span>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/tai-khoan" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]">
              Xem don hang
            </Link>
            <Link href="/san-pham" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-panel-soft px-4 text-sm font-semibold text-frost transition-colors hover:border-pulse/50 hover:bg-panel">
              Tiep tuc mua
            </Link>
          </div>
        </div>
      ) : status === "failed" ? (
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/12 text-danger">
            <XCircle size={28} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-frost">Thanh toan that bai</h2>
          <p className="mt-3 text-sm leading-6 text-steel">
            Giao dich qua VNPAY khong thanh cong hoac bi huy.
          </p>
          <div className="mt-6 grid gap-3">
            <Link href="/gio-hang" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]">
              Thanh toan lai
            </Link>
            <Link href="/san-pham" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-panel-soft px-4 text-sm font-semibold text-frost transition-colors hover:border-pulse/50 hover:bg-panel">
              Xem san pham khac
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/12 text-warning">
            <AlertCircle size={28} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-frost">Chu ky khong hop le</h2>
          <p className="mt-3 text-sm leading-6 text-steel">
            Chu ky bao mat cua giao dich khong chinh xac hoac da bi sua doi.
          </p>
          <div className="mt-6">
            <Link href="/san-pham" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-line bg-panel-soft px-4 text-sm font-semibold text-frost transition-colors hover:border-pulse/50 hover:bg-panel">
              Quay ve cua hang
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VnpayReturnPage() {
  return (
    <CustomerShell>
      <section className="shell py-16 flex flex-col items-center justify-center">
        <Suspense fallback={
          <div className="max-w-md w-full rounded-lg border border-line bg-panel p-6 text-center">
            <div className="py-8">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pulse border-t-transparent"></div>
              <h2 className="mt-5 text-xl font-semibold text-frost">Dang tai...</h2>
            </div>
          </div>
        }>
          <VnpayReturnContent />
        </Suspense>
      </section>
    </CustomerShell>
  );
}
