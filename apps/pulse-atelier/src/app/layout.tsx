import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse Atelier - Premium smart devices",
  description:
    "Pulse Atelier curates premium smartwatches, earbuds, tablets, and personal smart accessories.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
