"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  Gift,
  Headphones,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  PackageSearch,
  PenLine,
  Settings,
  UserCog,
  UsersRound,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const adminLinks = [
  { href: "/admin", label: "Tong quan", icon: LayoutDashboard },
  { href: "/admin/san-pham", label: "San pham", icon: PackageSearch },
  { href: "/admin/don-hang", label: "Don hang", icon: ClipboardList },
  { href: "/admin/khach-hang", label: "Khach hang", icon: UsersRound },
  { href: "/admin/tai-khoan", label: "Tai khoan", icon: UserCog },
  { href: "/admin/kho", label: "Kho", icon: Boxes },
  { href: "/admin/ma-giam-gia", label: "Ma giam gia", icon: Gift },
  { href: "/admin/danh-gia", label: "Danh gia", icon: MessageSquareText },
  { href: "/admin/ho-tro", label: "Ho tro", icon: Headphones },
  { href: "/admin/noi-dung", label: "Noi dung", icon: PenLine },
  { href: "/admin/cai-dat", label: "Cai dat", icon: Settings },
];

function AdminNavLink({
  href,
  label,
  icon: Icon,
  compact = false,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-3 rounded-lg text-sm font-medium text-steel transition-colors hover:bg-panel-soft hover:text-frost focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse",
        compact ? "min-w-max px-3 py-2" : "w-full px-3 py-2.5",
      )}
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-obsidian px-4 py-10 text-frost">
        <EmptyState
          title="Can dang nhap admin"
          description="Dang nhap bang tai khoan admin de quan tri cua hang."
          action={
            <Link
              href="/dang-nhap"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
            >
              Dang nhap admin
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-frost lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line/70 bg-graphite/92 px-4 py-5 lg:block">
        <Link
          href="/admin"
          className="mb-7 flex items-center gap-3 rounded-lg px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-signal/40 bg-signal/14 text-sm font-black text-[#B8BFFF]">
            PA
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase">Pulse Admin</span>
            <span className="block text-xs text-steel">Boutique operations</span>
          </span>
        </Link>
        <nav className="space-y-1" aria-label="Admin navigation">
          {adminLinks.map((link) => (
            <AdminNavLink key={link.href} {...link} />
          ))}
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-full inline-flex items-center gap-3 rounded-lg text-sm font-medium text-steel transition-colors hover:bg-danger/20 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse px-3 py-2.5"
          >
            <LogOut size={18} aria-hidden="true" />
            Đăng xuất
          </button>
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-obsidian/90 backdrop-blur-xl lg:hidden">
          <div className="px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Link
                href="/admin"
                className="text-sm font-semibold uppercase text-frost focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
              >
                Pulse Admin
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/"
                  className="rounded-lg border border-line bg-panel-soft px-3 py-2 text-xs font-semibold text-steel transition-colors hover:text-frost focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
                >
                  Storefront
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Admin mobile navigation">
              {adminLinks.map((link) => (
                <AdminNavLink key={link.href} {...link} compact />
              ))}
            </nav>
          </div>
        </header>
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
