"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

type SalesData = {
  totalSales: number;
  orderCount: number;
  averageOrder: number;
  productSales: { name: string; sales: number }[];
  comparison: number;
};

export function SalesClient({ initialData }: { initialData: SalesData }) {
  const [period, setPeriod] = useState<"today" | "week" | "month">("month");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  async function changePeriod(p: "today" | "week" | "month") {
    setPeriod(p);
    setLoading(true);
    const res = await fetch(`/api/sales?period=${p}`);
    if (res.ok) {
      const newData = await res.json();
      setData(newData);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales</h1>
          <p className="mt-1 text-slate-500">Revenue reports and analytics</p>
        </div>
        <div className="flex gap-2">
          {(["today", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => changePeriod(p)}
              className={`rounded-xl px-4 py-2 text-sm font-medium capitalize ${
                period === p
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Sales</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {loading ? "..." : formatCurrency(data.totalSales)}
          </p>
          {data.comparison > 0 && (
            <p className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4" />+{data.comparison}% vs last period
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Orders</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {loading ? "..." : data.orderCount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Average Order</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {loading ? "..." : formatCurrency(data.averageOrder)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Sales by Product</h2>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.productSales} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `RM${v}`} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="sales" fill="#059669" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
