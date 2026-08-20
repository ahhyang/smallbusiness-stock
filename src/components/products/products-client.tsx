"use client";

import { formatCurrency, formatNumber } from "@/lib/utils";
import { useStore } from "@/components/store-provider";

export function ProductsClient() {
  const { products, inventory } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <p className="mt-1 text-slate-500">
          Recipes drive automatic inventory deduction on every sale
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {product.emoji} {product.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{product.category}</p>
              </div>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(product.price)}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700">
                Ingredients (per serving)
              </h3>
              <div className="mt-2 space-y-1">
                {product.ingredients.map((ing, i) => {
                  const inv = inventory.find((item) => item.id === ing.inventoryItemId);
                  const low = inv && inv.currentQty <= inv.minimumQty;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        low ? "bg-amber-50" : "bg-slate-50"
                      }`}
                    >
                      <span className="text-slate-600">
                        {inv?.name || "Ingredient"}
                        {low ? " · low" : ""}
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatNumber(ing.quantity, ing.quantity < 1 ? 3 : 0)}{" "}
                        {inv?.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
