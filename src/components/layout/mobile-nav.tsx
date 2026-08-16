"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  CreditCard,
  Menu,
  X,
  Users,
  Scissors,
  Package,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const PRIMARY_ITEMS = [
  { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bronlar", icon: CalendarDays },
  { href: "/dashboard/customers", label: "Mijozlar", icon: UserRound },
  { href: "/dashboard/payments", label: "To'lovlar", icon: CreditCard },
] as const;

const MORE_ITEMS = [
  { href: "/dashboard/calendar", label: "Kalendar", icon: CalendarDays },
  { href: "/dashboard/employees", label: "Xodimlar", icon: Users },
  { href: "/dashboard/services", label: "Xizmatlar", icon: Scissors },
  { href: "/dashboard/inventory", label: "Ombor", icon: Package },
  { href: "/dashboard/reports", label: "Hisobotlar", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Sozlamalar", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname?.startsWith(href));
  const moreActive = MORE_ITEMS.some((item) => isActive(item.href));

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Yopish"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Boshqa bo&apos;limlar</span>
              <button
                aria-label="Yopish"
                onClick={() => setMoreOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-surface-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MORE_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-card border border-border px-2 py-3 text-xs font-medium",
                    isActive(href) ? "border-accent-500 bg-accent-50 text-accent-700" : "text-slate-600"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {PRIMARY_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              isActive(href) ? "text-accent-700" : "text-slate-500"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
            moreActive ? "text-accent-700" : "text-slate-500"
          )}
        >
          <Menu className="h-5 w-5" />
          Yana
        </button>
      </nav>
    </>
  );
}
