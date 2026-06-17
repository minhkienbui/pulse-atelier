"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Phone,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const NAV_ITEMS = [
  { label: "Trang Chủ", href: "/" },
  {
    label: "Bộ Sưu Tập",
    href: "/bo-suu-tap",
    children: [
      { label: "Đồng Hồ Nam", href: "/bo-suu-tap?category=dong-ho-nam" },
      { label: "Đồng Hồ Nữ", href: "/bo-suu-tap?category=dong-ho-nu" },
      { label: "Đồng Hồ Thể Thao", href: "/bo-suu-tap?category=dong-ho-the-thao" },
      { label: "Đồng Hồ Cổ Điển", href: "/bo-suu-tap?category=dong-ho-co-dien" },
    ],
  },
  {
    label: "Thương Hiệu",
    href: "/thuong-hieu",
    children: [
      { label: "Rolex", href: "/bo-suu-tap?brand=rolex" },
      { label: "Patek Philippe", href: "/bo-suu-tap?brand=patek-philippe" },
      { label: "Audemars Piguet", href: "/bo-suu-tap?brand=audemars-piguet" },
      { label: "Omega", href: "/bo-suu-tap?brand=omega" },
      { label: "IWC Schaffhausen", href: "/bo-suu-tap?brand=iwc" },
      { label: "Cartier", href: "/bo-suu-tap?brand=cartier" },
    ],
  },
  { label: "Bài Viết", href: "/bai-viet" },
  { label: "Bảo Hành", href: "/bao-hanh" },
  { label: "Liên Hệ", href: "/lien-he" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const cartItemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getItemCount());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
      setActiveDropdown(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleDropdown = useCallback((label: string) => {
    setActiveDropdown((prev) => (prev === label ? null : label));
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-dark-surface border-b border-dark-border/50">
        <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center justify-between text-xs text-ivory-muted">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone size={12} className="text-gold" />
              Hotline: <strong className="text-gold">1900 8888</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-gold" />
              T2 - CN: 9:00 - 21:00
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Miễn phí vận chuyển đơn hàng trên 50 triệu</span>
            <span className="text-dark-border">|</span>
            <span>Bảo hành quốc tế chính hãng</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass-header shadow-lg shadow-black/20"
            : "bg-dark-bg/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <span className="brand-wordmark text-2xl lg:text-3xl heading-gold">
                  TEMPUS
                </span>
                <span className="block text-[8px] lg:text-[9px] tracking-[0.35em] text-gold/60 uppercase text-center -mt-1">
                  Since 2020
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors duration-300 ${
                      pathname === item.href
                        ? "text-gold"
                        : "text-ivory/70 hover:text-gold"
                    }`}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 py-2 min-w-[220px] glass-dark rounded-lg shadow-dark-lg"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-5 py-2.5 text-sm text-ivory/70 hover:text-gold hover:bg-white/[0.03] transition-all duration-200"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="relative p-2.5 rounded-full text-ivory/60 hover:text-gold hover:bg-white/[0.04] transition-all duration-300"
                aria-label="Tìm kiếm"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2.5 rounded-full text-ivory/60 hover:text-gold hover:bg-white/[0.04] transition-all duration-300 hidden sm:flex"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-dark-bg bg-gold rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/gio-hang"
                className="relative p-2.5 rounded-full text-ivory/60 hover:text-gold hover:bg-white/[0.04] transition-all duration-300"
              >
                <ShoppingBag size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-dark-bg bg-gold rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User */}
              <Link
                href="/tai-khoan"
                className="relative p-2.5 rounded-full text-ivory/60 hover:text-gold hover:bg-white/[0.04] transition-all duration-300 hidden sm:flex"
              >
                <User size={20} />
              </Link>

              {/* Mobile Menu */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2.5 rounded-full text-ivory/60 hover:text-gold transition-colors"
                aria-label="Menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-dark-bg/90 backdrop-blur-xl flex items-start justify-center pt-[15vh]"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              className="w-full max-w-2xl px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <form action="/bo-suu-tap" className="relative">
                <Search
                  size={24}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/60"
                />
                <input
                  name="q"
                  type="text"
                  placeholder="Tìm kiếm đồng hồ, thương hiệu..."
                  autoFocus
                  className="w-full py-5 pl-16 pr-14 text-lg text-ivory bg-dark-card/80 border border-dark-border rounded-xl focus:border-gold/50 focus:shadow-[0_0_0_2px_rgba(201,168,76,0.1)] transition-all placeholder:text-ivory/30"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-ivory/40 hover:text-gold transition-colors"
                >
                  <X size={20} />
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-ivory/30">
                Nhấn ESC để đóng
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[80] w-[300px] bg-dark-surface border-l border-dark-border overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xl heading-gold tracking-[0.15em]">TEMPUS</span>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 rounded-full text-ivory/50 hover:text-gold transition-colors"
                  >
                    <X size={22} />
                  </button>
                </div>

                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <div key={item.label}>
                      {item.children ? (
                        <div>
                          <button
                            onClick={() => handleDropdown(item.label)}
                            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-ivory/70 hover:text-gold transition-colors rounded-lg hover:bg-white/[0.03]"
                          >
                            {item.label}
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-200 ${
                                activeDropdown === item.label ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {activeDropdown === item.label && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-4"
                              >
                                {item.children.map((child) => (
                                  <Link
                                    key={child.label}
                                    href={child.href}
                                    className="block px-4 py-2.5 text-sm text-ivory/50 hover:text-gold transition-colors"
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={`block px-4 py-3 text-sm font-medium transition-colors rounded-lg hover:bg-white/[0.03] ${
                            pathname === item.href
                              ? "text-gold"
                              : "text-ivory/70 hover:text-gold"
                          }`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-dark-border/50 space-y-3">
                  <Link
                    href="/tai-khoan"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-ivory/60 hover:text-gold transition-colors rounded-lg hover:bg-white/[0.03]"
                  >
                    <User size={18} />
                    Tài Khoản
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-ivory/60 hover:text-gold transition-colors rounded-lg hover:bg-white/[0.03]"
                  >
                    <Heart size={18} />
                    Yêu Thích ({wishlistCount})
                  </Link>
                </div>

                <div className="mt-8 p-4 glass-gold rounded-lg">
                  <p className="text-xs text-gold font-medium mb-1">Hotline hỗ trợ</p>
                  <p className="text-lg font-bold text-gold-light">1900 8888</p>
                  <p className="text-[11px] text-ivory/40 mt-1">T2 - CN: 9:00 - 21:00</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
