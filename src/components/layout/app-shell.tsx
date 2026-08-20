"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  Package,
  Coffee,
  BarChart3,
  Bot,
  LogOut,
  Store,
  ChevronDown,
  Bell,
  Menu,
  X,
  Users,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useStore } from "@/components/store-provider";
import { format } from "date-fns";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/products", label: "Products", icon: Coffee },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/sales", label: "Sales", icon: BarChart3 },
  { href: "/ai", label: "AI Assistant", icon: Bot },
];

function severityClass(severity: string) {
  if (severity === "critical") return "border-red-200 bg-red-50";
  if (severity === "warning") return "border-amber-200 bg-amber-50";
  return "border-slate-200 bg-white";
}

export function AppShell({
  businessName,
  userName,
  children,
}: {
  businessName: string;
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useStore();
  const [showBranches, setShowBranches] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const activeBranch = store.branches.find((b) => b.id === store.branchId);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const nav = (
    <>
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">SmartStore</p>
            <p className="text-xs text-slate-500">{businessName}</p>
          </div>
        </div>

        <div className="relative mt-4">
          <button
            onClick={() => setShowBranches(!showBranches)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-100"
          >
            <span className="truncate font-medium text-slate-700">
              {activeBranch?.name || "All Branches"}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          {showBranches && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  store.setBranchId("");
                  setShowBranches(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                All Branches
              </button>
              {store.branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => {
                    store.setBranchId(branch.id);
                    setShowBranches(false);
                  }}
                  className={cn(
                    "block w-full px-3 py-2 text-left text-sm hover:bg-slate-50",
                    branch.id === store.branchId && "bg-emerald-50 text-emerald-700",
                  )}
                >
                  {branch.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const badge =
            item.href === "/orders"
              ? store.pendingCount
              : item.href === "/inventory"
                ? store.lowCount
                : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700",
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-700">{userName}</p>
        <p className="text-xs text-slate-400">Owner</p>
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 text-sm text-slate-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="hidden h-full w-64 flex-col border-r border-slate-200 bg-white md:flex">
        {nav}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative z-50 flex h-full w-72 flex-col bg-white shadow-xl">
            <button
              className="absolute right-3 top-3 rounded-lg p-1 text-slate-500"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(), "EEEE, d MMM")}
              </p>
              <p className="text-xs text-slate-500">
                {activeBranch?.name || "All branches"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/orders"
              className="hidden items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              New order
            </Link>
            <Link
              href="/ai"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              title="AI Assistant"
            >
              <Bot className="h-5 w-5" />
            </Link>
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen(!bellOpen);
                  store.markAllRead();
                }}
                className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              >
                <Bell className="h-5 w-5" />
                {store.unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {store.unreadCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <p className="text-sm font-semibold">AI Alerts</p>
                    <button
                      className="text-xs text-slate-500"
                      onClick={() => setBellOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {store.alerts.length === 0 && (
                      <p className="p-4 text-sm text-slate-400">No alerts right now.</p>
                    )}
                    {store.alerts.map((alert) => (
                      <Link
                        key={alert.id}
                        href={alert.href}
                        onClick={() => {
                          store.markRead(alert.id);
                          setBellOpen(false);
                        }}
                        className={cn(
                          "block border-b px-4 py-3 text-sm last:border-0",
                          severityClass(alert.severity),
                        )}
                      >
                        <p className="font-medium text-slate-900">{alert.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                          {alert.message}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>

      {store.toast && (
        <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{store.toast.title}</p>
              <p className="mt-1 text-xs text-slate-600">{store.toast.message}</p>
              <div className="mt-3 flex gap-2">
                <Link
                  href={store.toast.href}
                  onClick={store.dismissToast}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Open
                </Link>
                <button
                  onClick={store.dismissToast}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {store.popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-700">
              <Bot className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-wide">AI Alert</p>
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">{store.popup.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{store.popup.message}</p>
            <div className="mt-6 flex gap-2">
              <Link
                href={store.popup.href}
                onClick={store.dismissPopup}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white"
              >
                Take action
              </Link>
              <button
                onClick={store.dismissPopup}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
