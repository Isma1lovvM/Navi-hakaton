// OWNER: Frontend-1
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { OnlineStatusBadge } from "@/components/layout/online-status-badge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-16 shrink-0 border-r border-border bg-surface md:block lg:w-60">
        <div className="flex items-center justify-center px-2 py-4 lg:justify-start lg:px-4">
          <span className="text-lg font-semibold text-accent-700">
            <span className="lg:hidden">BF</span>
            <span className="hidden lg:inline">BizFlow</span>
          </span>
        </div>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:justify-end md:px-8">
          <span className="text-lg font-semibold text-accent-700 md:hidden">BizFlow</span>
          <OnlineStatusBadge />
        </header>

        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
