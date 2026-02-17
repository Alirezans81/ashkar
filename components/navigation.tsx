"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/theme-toggle";

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "داشبورد" },
    { href: "/transactions", label: "تراکنش‌ها" },
    { href: "/reports", label: "گزارش‌ها" },
    { href: "/verify", label: "تایید صحت" },
    { href: "/export", label: "خروجی گزارش" },
  ];

  return (
    <div className="mr-4 hidden md:flex">
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors hover:text-foreground ${
              pathname === item.href
                ? "font-bold text-foreground"
                : "text-foreground/60"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <ModeToggle />
      </nav>
    </div>
  );
}

export function MobileNav() {
  // Mobile navigation implementation would go here
  return null;
}
