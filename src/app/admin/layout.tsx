"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Watch,
  Tags,
  FolderTree,
  ShoppingCart,
  FileText,
  Star,
  Shield,
  Package,
  Users,
  Truck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Tổng Quan", href: "/admin" },
  { icon: Watch, label: "Sản Phẩm", href: "/admin/san-pham" },
  { icon: Tags, label: "Thương Hiệu", href: "/admin/thuong-hieu" },
  { icon: FolderTree, label: "Danh Mục", href: "/admin/danh-muc" },
  { icon: ShoppingCart, label: "Đơn Hàng", href: "/admin/don-hang" },
  { icon: FileText, label: "Bài Viết", href: "/admin/bai-viet" },
  { icon: Star, label: "Đánh Giá", href: "/admin/danh-gia" },
  { icon: Shield, label: "Bảo Hành", href: "/admin/bao-hanh" },
  { icon: Package, label: "Kho Hàng", href: "/admin/kho-hang" },
  { icon: Truck, label: "Nhà Cung Cấp", href: "/admin/nha-cung-cap" },
  { icon: Users, label: "Người Dùng", href: "/admin/nguoi-dung" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0E0E0E]">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen admin-sidebar transition-all duration-300 flex flex-col ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-dark-border/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-gold heading-serif">T</span>
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <span className="text-lg font-bold tracking-[0.1em] heading-gold">
                  TEMPUS
                </span>
                <span className="block text-[8px] tracking-[0.2em] text-gold/40 uppercase -mt-0.5">
                  Admin Panel
                </span>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gold/10 text-gold"
                      : "text-ivory/40 hover:text-ivory/70 hover:bg-white/[0.03]"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gold rounded-r-full" />
                  )}
                  <item.icon
                    size={18}
                    className={`shrink-0 ${isActive ? "text-gold" : "text-ivory/30 group-hover:text-ivory/50"}`}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
            
            {/* Logout Button */}
            <button
              onClick={() => {
                signOut({ callbackUrl: "/dang-nhap" });
                toast.success("Đang đăng xuất...");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.05] cursor-pointer`}
            >
              <LogOut
                size={18}
                className="shrink-0 text-red-400/50 group-hover:text-red-400"
              />
              {!collapsed && (
                <span className="truncate">Đăng xuất</span>
              )}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-dark-border/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-ivory/30 hover:text-ivory/50 hover:bg-white/[0.03] transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 border-b border-dark-border/10 bg-[#0E0E0E]/90 backdrop-blur-lg">
          <h2 className="text-sm font-medium text-ivory/60">
            {MENU_ITEMS.find((m) => m.href === pathname)?.label || "Admin"}
          </h2>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.03] transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full" />
            </button>
            <button className="p-2 rounded-lg text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.03] transition-colors">
              <Settings size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="text-xs font-bold text-gold">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
