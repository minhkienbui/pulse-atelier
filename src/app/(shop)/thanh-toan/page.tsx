import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/dang-nhap");
  }

  return (
    <CheckoutForm
      defaultName={session.user.name || ""}
      defaultEmail={session.user.email || ""}
    />
  );
}
