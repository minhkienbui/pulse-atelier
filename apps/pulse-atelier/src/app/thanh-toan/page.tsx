import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Badge } from "@/components/ui/Badge";

export default function CheckoutPage() {
  return (
    <CustomerShell>
      <section className="shell py-12">
        <Badge variant="mint">Checkout</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-frost">Thanh toan</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
          Hoan tat thong tin giao hang va chon phuong thuc thanh toan phu hop.
        </p>
      </section>
      <section className="shell pb-12">
        <CheckoutForm />
      </section>
    </CustomerShell>
  );
}
