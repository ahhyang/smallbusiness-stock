"use client";

import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Calendar,
  AlertTriangle,
  PackageX,
  Plus,
  Bot,
} from "lucide-react";
import { format } from "date-fns";
import { useStore } from "@/components/store-provider";

export function DashboardClient() {
  const store = useStore();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const todayBookings = store.bookings
    .filter((b) => b.pickupDate === format(new Date(), "yyyy-MM-dd"))
    .sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));

  const queue = store.orders
    .filter((o) => ["pending", "confirmed", "preparing", "ready"].includes(o.status))
    .slice(0, 6);

  const lowItems = store.inventory.filter((i) => i.currentQty <= i.minimumQty);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting()} 👋</h1>
          <p className="mt-1 text-slate-500">
            {format(new Date(), "EEEE, dd MMMM yyyy")}
            {!store.branchId && " · All Branches"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> New order
          </Link>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            New booking
          </Link>
          <Link
            href="/ai"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Bot className="h-4 w-4" /> Ask AI
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(store.todaySales)}
          icon={DollarSign}
          variant="success"
        />
        <StatCard title="Orders" value={store.todayOrderCount} icon={ShoppingBag} />
        <StatCard
          title="Pending Orders"
          value={store.pendingCount}
          icon={Clock}
          variant={store.pendingCount > 0 ? "warning" : "default"}
        />
        <StatCard title="Bookings" value={store.todayBookingCount} icon={Calendar} />
        <StatCard
          title="Low Stock"
          value={store.lowCount}
          icon={AlertTriangle}
          variant={store.lowCount > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Out of Stock"
          value={store.outCount}
          icon={PackageX}
          variant={store.outCount > 0 ? "danger" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Sales</h2>
          <div className="mt-4 space-y-3">
            {store.hourlySales.map((item) => (
              <div
                key={item.hour}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-600">{item.hour}</span>
                <span className="text-sm font-bold text-emerald-600">
                  {formatCurrency(item.sales)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Popular Products</h2>
          <div className="mt-4 space-y-3">
            {store.popularProducts.map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">
                  {product.emoji} {product.name}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-sm font-bold text-emerald-700">
                  {product.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Kitchen queue</h2>
            <Link href="/orders" className="text-sm text-emerald-700">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {queue.length === 0 && (
              <p className="text-sm text-slate-400">All orders are completed.</p>
            )}
            {queue.map((order) => (
              <div key={order.id} className="rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">#{order.orderNumber}</span>
                  <span className="capitalize text-slate-500">{order.status}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {order.customerName} · {formatCurrency(order.total)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Today&apos;s pickups</h2>
            <Link href="/bookings" className="text-sm text-emerald-700">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {todayBookings.length === 0 && (
              <p className="text-sm text-slate-400">No pickups today.</p>
            )}
            {todayBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium">{b.pickupTime.slice(0, 5)}</span>
                <span>{b.items.reduce((s, i) => s + i.quantity, 0)} drinks</span>
                <span className="text-slate-500">{b.customerName}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Restock now</h2>
            <Link href="/inventory?filter=low" className="text-sm text-emerald-700">
              Inventory
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {lowItems.length === 0 && (
              <p className="text-sm text-slate-400">Stock levels are healthy.</p>
            )}
            {lowItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex justify-between rounded-xl bg-amber-50 px-3 py-2 text-sm"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-amber-700">
                  {item.currentQty}
                  {item.unit} / {item.minimumQty}
                  {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
