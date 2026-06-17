import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ChatBubble from "@/components/layout/ChatBubble";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <ScrollToTop />
      <ChatBubble />
    </div>
  );
}
