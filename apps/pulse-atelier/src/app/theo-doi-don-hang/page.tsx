import { Suspense } from "react";
import { TrackingClient } from "@/app/theo-doi-don-hang/TrackingClient";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OrderTrackingPage() {
  return (
    <CustomerShell>
      <section className="shell py-12">
        <Badge variant="mint">Tracking</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-frost">Theo doi don hang</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
          Tim ma don hang de xem trang thai xu ly, van chuyen, thanh toan va chi tiet giao hang.
        </p>
      </section>
      <section className="shell pb-12">
        <Suspense fallback={<EmptyState title="Dang tai theo doi don hang" />}>
          <TrackingClient />
        </Suspense>
      </section>
    </CustomerShell>
  );
}
