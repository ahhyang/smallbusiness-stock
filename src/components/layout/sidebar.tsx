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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/products", label: "Products", icon: Coffee },
  { href: "/sales", label: "Sales", icon: BarChart3 },
  { href: "/ai", label: "AI Assistant", icon: Bot },
];

type SidebarProps = {
  businessName: string;
  branches: { id: string; name: string }[];
  activeBranchId: string;
  userName: string;
};

export function Sidebar({
  businessName,
  branches,
  activeBranchId,
  userName,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showBranches, setShowBranches] = useState(false);

  const activeBranch = branches.find((b) => b.id === activeBranchId);

  async function handleBranchChange(branchId: string) {
    await fetch("/api/branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId }),
    });
    setShowBranches(false);
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
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
                onClick={() => handleBranchChange("")}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                All Branches
              </button>
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchChange(branch.id)}
                  className={cn(
                    "block w-full px-3 py-2 text-left text-sm hover:bg-slate-50",
                    branch.id === activeBranchId && "bg-emerald-50 text-emerald-700",
                  )}
                >
                  {branch.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-700">{userName}</p>
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 text-sm text-slate-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
