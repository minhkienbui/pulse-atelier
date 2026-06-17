"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Heart, LogOut, Scale, ShoppingBag, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useCompareStore } from "@/stores/compare-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const navLinks = [
  { href: "/san-pham", label: "San pham" },
  { href: "/so-sanh", label: "So sanh" },
  { href: "/gio-hang", label: "Gio hang" },
  { href: "/tai-khoan", label: "Tai khoan" },
];

function CounterLink({
  href,
  label,
  count,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  icon: typeof ShoppingBag;
}) {
  return (
    <Link
      href={href}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-panel-soft text-steel transition-colors hover:border-pulse/50 hover:text-frost focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
      aria-label={label}
      title={label}
    >
      <Icon size={18} aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-pulse px-1.5 text-center text-[11px] font-bold leading-5 text-obsidian">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function Header({ className }: { className?: string }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const compareCount = useCompareStore((state) => state.productIds.length);

  return (
    <header className={cn("sticky top-0 z-40 border-b border-line/70 bg-obsidian/88 backdrop-blur-xl", className)}>
      <div className="shell flex min-h-20 items-center justify-between gap-5">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
          aria-label="Pulse Atelier home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-pulse/35 bg-pulse/12 text-sm font-black text-pulse">
            PA
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase text-frost">
              Pulse Atelier
            </span>
            <span className="block text-xs text-steel">Premium tech boutique</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Customer navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-steel transition-colors hover:bg-panel-soft hover:text-frost focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-steel transition-colors hover:bg-panel-soft hover:text-frost focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
            >
              Admin
            </Link>
          )}
        </nav>
 
         <div className="flex items-center gap-2">
           <CounterLink href="/gio-hang" label="Gio hang" count={cartCount} icon={ShoppingBag} />
           <CounterLink href="/tai-khoan#wishlist" label="Yeu thich" count={wishlistCount} icon={Heart} />
           <CounterLink href="/so-sanh" label="So sanh" count={compareCount} icon={Scale} />
           <Link
             href="/tai-khoan"
             className="hidden h-10 w-10 items-center justify-center rounded-lg border border-line bg-panel-soft text-steel transition-colors hover:border-pulse/50 hover:text-frost focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse sm:inline-flex"
             aria-label={user ? user.name : "Tai khoan"}
             title={user ? user.name : "Tai khoan"}
           >
             <UserRound size={18} aria-hidden="true" />
           </Link>
           {user && (
             <button
               onClick={() => {
                 logout();
                 router.push("/");
               }}
               className="hidden h-10 w-10 items-center justify-center rounded-lg border border-line bg-panel-soft text-steel transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse sm:inline-flex"
               aria-label="Dang xuat"
               title="Dang xuat"
             >
               <LogOut size={18} aria-hidden="true" />
             </button>
           )}
           {user?.role === "admin" && (
             <Link
               href="/admin"
               className="hidden h-10 w-10 items-center justify-center rounded-lg border border-signal/35 bg-signal/12 text-[#B8BFFF] transition-colors hover:border-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse sm:inline-flex"
               aria-label="Admin"
               title="Admin"
             >
               <BarChart3 size={18} aria-hidden="true" />
             </Link>
           )}
         </div>
      </div>
    </header>
  );
}
