// OWNER: Frontend-1
import { SidebarNav } from "@/components/layout/sidebar-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block">
        <div className="px-4 py-4 text-lg font-semibold text-accent-700">BizFlow</div>
        <SidebarNav />
      </aside>
      {/* TODO(Frontend-1): mobile nav (bottom bar or drawer) — spec section 27, "compact navigation" */}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
