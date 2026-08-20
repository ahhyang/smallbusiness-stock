"use client";

import { useMemo, useState } from "react";
import { Badge, getOrderStatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRight, Plus } from "lucide-react";
import { useStore } from "@/components/store-provider";
import type { DemoOrder } from "@/lib/demo-store";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
];

const NEXT_STATUS: Record<string, DemoOrder["status"]> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "completed",
};

export function OrdersClient() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: "Walk-in",
    paymentMethod: "cash" as DemoOrder["paymentMethod"],
    productId: "",
    quantity: 1,
  });

  const products = store.products;
  const productId = form.productId || products[0]?.id || "";

  const filtered = useMemo(
    () =>
      activeTab === "all"
        ? store.orders
        : store.orders.filter((o) => o.status === activeTab),
    [activeTab, store.orders],
  );

  function createOrder(e: React.FormEvent) {
    e.preventDefault();
    const branchId = store.branchId || store.branches[0]?.id;
    if (!productId || !branchId) return;
    store.createOrder({
      branchId,
      customerName: form.customerName,
      paymentMethod: form.paymentMethod,
      items: [{ productId, quantity: form.quantity }],
    });
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-slate-500">Kitchen board — tap to move each ticket forward</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          New order
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createOrder}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
        >
          <h2 className="font-semibold text-emerald-900">Walk-in order</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              placeholder="Customer name"
            />
            <select
              value={productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentMethod: e.target.value as DemoOrder["paymentMethod"],
                })
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="qr">QR</option>
              <option value="online_transfer">Online transfer</option>
            </select>
          </div>
          <p className="mt-3 text-xs text-emerald-800">
            Creating an order deducts recipe ingredients and may trigger a low-stock AI alert.
          </p>
          <button
            type="submit"
            className="mt-4 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white"
          >
            Create order
          </button>
        </form>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 text-xs opacity-75">
                ({store.orders.filter((o) => o.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.slice(0, 40).map((order) => {
          const statusBadge = getOrderStatusBadge(order.status);
          const nextStatus = NEXT_STATUS[order.status];

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold text-slate-900">
                      #{order.orderNumber}
                    </span>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.customerName || "Walk-in"} ·{" "}
                    {format(new Date(order.createdAt), "hh:mm a")} ·{" "}
                    {order.paymentMethod?.replace("_", " ") || "cash"}
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(order.total)}
                </p>
              </div>

              <div className="mt-3 space-y-1">
                {order.items.map((item, i) => (
                  <p key={i} className="text-sm text-slate-600">
                    {item.productName} x {item.quantity}
                  </p>
                ))}
              </div>

              {nextStatus && (
                <button
                  onClick={() => store.updateOrderStatus(order.id, nextStatus)}
                  className="mt-4 flex items-center gap-1 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Move to {nextStatus}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            No orders in this column
          </div>
        )}
      </div>
    </div>
  );
}
