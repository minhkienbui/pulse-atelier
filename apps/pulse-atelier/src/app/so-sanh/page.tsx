import { CustomerShell } from "@/components/layout/CustomerShell";
import { CompareTable } from "@/components/compare/CompareTable";
import { Badge } from "@/components/ui/Badge";

export default function ComparePage() {
  return (
    <CustomerShell>
      <section className="shell py-12">
        <Badge variant="mint">Compare Lab</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-frost">So sanh san pham</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
          Chon 2 den 4 thiet bi tu catalog de xem gia, pin, he sinh thai, cam bien va bao hanh tren cung mot bang.
        </p>
      </section>

      <section className="shell pb-12">
        <CompareTable />
      </section>
    </CustomerShell>
  );
}
