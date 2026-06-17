import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "TEMPUS — Đồng Hồ Cao Cấp Chính Hãng",
  description:
    "Tempus.vn — Đại lý phân phối đồng hồ cao cấp chính hãng. Rolex, Patek Philippe, Audemars Piguet, Omega, IWC và nhiều thương hiệu danh tiếng khác. Bảo hành quốc tế, giao hàng toàn quốc.",
  keywords: [
    "đồng hồ cao cấp",
    "đồng hồ chính hãng",
    "Rolex Việt Nam",
    "Patek Philippe",
    "Audemars Piguet",
    "đồng hồ luxury",
    "tempus.vn",
  ],
  openGraph: {
    title: "TEMPUS — Đồng Hồ Cao Cấp Chính Hãng",
    description:
      "Đại lý phân phối đồng hồ cao cấp chính hãng số 1 Việt Nam",
    type: "website",
    locale: "vi_VN",
    siteName: "Tempus.vn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} ${cormorantGaramond.variable} antialiased w-full min-h-screen`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
