"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatNumber } from "@/lib/utils";
import { AlertTriangle, PackageX, Plus, Minus } from "lucide-react";
import { useStore } from "@/components/store-provider";
import type { DemoInventoryItem } from "@/lib/demo-store";

export function InventoryClient() {
  const store = useStore();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<"all" | "raw" | "finished" | "low">("all");
  const [showStockIn, setShowStockIn] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DemoInventoryItem | null>(null);
  const [stockInForm, setStockInForm] = useState({
    quantity: 50,
    cost: 150,
    supplier: "ABC Supplier",
  });
  const [adjustForm, setAdjustForm] = useState({ quantity: -1, reason: "Damaged" });

  useEffect(() => {
    if (searchParams.get("filter") === "low") setFilter("low");
  }, [searchParams]);

  const inventory = store.inventory;
  const filtered = inventory.filter((item) => {
    if (filter === "raw") return item.type === "raw";
    if (filter === "finished") return item.type === "finished";
    if (filter === "low") return item.currentQty <= item.minimumQty;
    return true;
  });

  const rawItems = filtered.filter((i) => i.type === "raw");
  const finishedItems = filtered.filter((i) => i.type === "finished");
  const branchId = store.branchId || store.branches[0]?.id || "";

  function handleStockIn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    store.stockIn({
      branchId: selectedItem.branchId || branchId,
      inventoryItemId: selectedItem.id,
      ...stockInForm,
    });
    setShowStockIn(false);
  }

  function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    store.adjustStock({
      branchId: selectedItem.branchId || branchId,
      inventoryItemId: selectedItem.id,
      ...adjustForm,
    });
    setShowAdjust(false);
  }

  function StockLevel({ item }: { item: DemoInventoryItem }) {
    const isOut = item.currentQty <= 0;
    const isLow = !isOut && item.currentQty <= item.minimumQty;

    return (
      <div
        className={`rounded-2xl border p-5 shadow-sm ${
          isOut
            ? "border-red-200 bg-red-50"
            : isLow
              ? "border-amber-200 bg-amber-50"
              : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{item.name}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Current: {formatNumber(item.currentQty, 1)} {item.unit}
            </p>
            <p className="text-sm text-slate-500">
              Minimum: {formatNumber(item.minimumQty, 1)} {item.unit}
            </p>
            {isOut && (
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-red-600">
                <PackageX className="h-4 w-4" /> OUT OF STOCK
              </p>
            )}
            {isLow && (
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-amber-600">
                <AlertTriangle className="h-4 w-4" /> LOW STOCK
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedItem(item);
                setShowStockIn(true);
              }}
              className="rounded-lg bg-emerald-100 p-2 text-emerald-600 hover:bg-emerald-200"
              title="Stock In"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setSelectedItem(item);
                setShowAdjust(true);
              }}
              className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              title="Adjust"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <p className="mt-1 text-slate-500">
          Track raw materials and finished products
        </p>
      </div>

      <div className="flex gap-2">
        {(["all", "raw", "finished", "low"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize ${
              filter === f
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f === "low" ? "Low Stock" : f}
          </button>
        ))}
      </div>

      {showStockIn && selectedItem && (
        <form
          onSubmit={handleStockIn}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
        >
          <h2 className="font-semibold">Stock In: {selectedItem.name}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <input
              type="number"
              placeholder="Quantity"
              value={stockInForm.quantity}
              onChange={(e) =>
                setStockInForm({ ...stockInForm, quantity: +e.target.value })
              }
              className="rounded-xl border px-4 py-2.5 text-sm"
            />
            <input
              type="number"
              placeholder="Cost (RM)"
              value={stockInForm.cost}
              onChange={(e) =>
                setStockInForm({ ...stockInForm, cost: +e.target.value })
              }
              className="rounded-xl border px-4 py-2.5 text-sm"
            />
            <input
              placeholder="Supplier"
              value={stockInForm.supplier}
              onChange={(e) =>
                setStockInForm({ ...stockInForm, supplier: e.target.value })
              }
              className="rounded-xl border px-4 py-2.5 text-sm"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
            >
              Confirm Stock In
            </button>
            <button
              type="button"
              onClick={() => setShowStockIn(false)}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {showAdjust && selectedItem && (
        <form
          onSubmit={handleAdjust}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-6"
        >
          <h2 className="font-semibold">Adjust: {selectedItem.name}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              type="number"
              placeholder="Quantity (+/-)"
              value={adjustForm.quantity}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, quantity: +e.target.value })
              }
              className="rounded-xl border px-4 py-2.5 text-sm"
            />
            <input
              placeholder="Reason"
              value={adjustForm.reason}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, reason: e.target.value })
              }
              className="rounded-xl border px-4 py-2.5 text-sm"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white"
            >
              Confirm Adjustment
            </button>
            <button
              type="button"
              onClick={() => setShowAdjust(false)}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {rawItems.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Raw Materials
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rawItems.map((item) => (
              <StockLevel key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {finishedItems.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Finished Products
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {finishedItems.map((item) => (
              <StockLevel key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
