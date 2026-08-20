"use client";

import { formatCurrency } from "@/lib/utils";
import { useStore } from "@/components/store-provider";
import { WhatsAppButton } from "@/components/whatsapp-button";

export function CustomersClient() {
  const { customers } = useStore();
  const ranked = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="mt-1 text-slate-500">
          Repeat buyers, spend, and a one-tap WhatsApp follow-up
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
              <th className="px-4 py-3 font-medium">Last order</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((c, i) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {i + 1}. {c.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                <td className="px-4 py-3">{c.totalOrders}</td>
                <td className="px-4 py-3 font-semibold text-emerald-700">
                  {formatCurrency(c.totalSpent)}
                </td>
                <td className="px-4 py-3 text-slate-500">{c.lastOrder}</td>
                <td className="px-4 py-3">
                  <WhatsAppButton
                    phone={c.phone}
                    message={`Hi ${c.name} 👋\n\nThanks for supporting us! Reply here if you want to book a pickup.`}
                    label="Message"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
