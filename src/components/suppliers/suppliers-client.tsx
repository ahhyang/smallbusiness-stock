"use client";

import { useState } from "react";
import { useStore } from "@/components/store-provider";
import { SupplierRestockActions } from "@/components/suppliers/restock-actions";
import { Plus } from "lucide-react";

export function SuppliersClient() {
  const store = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    phone: "",
    whatsapp: "",
    notes: "",
  });

  const branchName =
    store.branches.find((b) => b.id === store.branchId)?.name || "All branches";

  function startEdit(id: string) {
    const s = store.suppliers.find((x) => x.id === id);
    if (!s) return;
    setForm({
      id: s.id,
      name: s.name,
      phone: s.phone,
      whatsapp: s.whatsapp,
      notes: s.notes || "",
    });
    setShowForm(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    store.upsertSupplier({
      id: form.id || undefined,
      name: form.name,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      notes: form.notes,
    });
    setShowForm(false);
    setForm({ id: "", name: "", phone: "", whatsapp: "", notes: "" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="mt-1 text-slate-500">
            Save WhatsApp numbers. When stock is low, one tap opens a ready-to-send restock message.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ id: "", name: "", phone: "", whatsapp: "", notes: "" });
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add supplier
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
        >
          <h2 className="font-semibold text-emerald-900">
            {form.id ? "Edit supplier" : "New supplier"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Supplier name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            <input
              required
              placeholder="Phone (012-xxxxxxx)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            <input
              placeholder="WhatsApp (same as phone if empty)"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            <input
              placeholder="Notes (what they supply)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {store.suppliers.map((supplier) => {
          const linked = store.inventory.filter((i) => i.supplierId === supplier.id);
          const low = linked.filter((i) => i.currentQty <= i.minimumQty);
          return (
            <div
              key={supplier.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{supplier.name}</h2>
                  <p className="text-sm text-slate-500">
                    Phone: {supplier.phone} · WhatsApp: {supplier.whatsapp}
                  </p>
                  {supplier.notes && (
                    <p className="mt-1 text-sm text-slate-500">{supplier.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => startEdit(supplier.id)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
              </div>

              {low.length > 0 && (
                <div className="mt-4 rounded-xl bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-800">
                    Low stock — message ready
                  </p>
                  <div className="mt-2 space-y-3">
                    {low.map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-slate-700">
                          {item.name} {item.currentQty}
                          {item.unit} / {item.minimumQty}
                          {item.unit}
                        </span>
                        <SupplierRestockActions
                          item={item}
                          supplier={supplier}
                          branchName={branchName}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Linked items
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {store.inventory
                    .filter((i, idx, arr) => arr.findIndex((x) => x.name === i.name) === idx)
                    .map((item) => {
                      const sample = store.inventory.find((i) => i.name === item.name)!;
                      const assigned = sample.supplierId === supplier.id;
                      return (
                        <button
                          key={item.name}
                          onClick={() =>
                            store.assignSupplierByName(
                              item.name,
                              assigned ? "" : supplier.id,
                            )
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            assigned
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.name}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
