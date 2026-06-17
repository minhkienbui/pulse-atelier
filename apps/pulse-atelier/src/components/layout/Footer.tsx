"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

const footerLinks = [
  { href: "/san-pham", label: "San pham" },
  { href: "/so-sanh", label: "So sanh" },
  { href: "/ho-tro", label: "Ho tro" },
];

export function Footer() {
  const user = useAuthStore((state) => state.user);

  return (
    <footer className="border-t border-line/70 bg-obsidian/80">
      <div className="shell grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-frost">Pulse Atelier</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-steel">
            Curated smart devices for focus, health, travel, and daily rhythm.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Footer navigation">
          {footerLinks.map((link) => (
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
      </div>
    </footer>
  );
}
