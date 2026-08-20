"use client";

import { useState } from "react";
import { Badge, getBookingStatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { Plus, Calendar } from "lucide-react";
import {
  WhatsAppButton,
  generateOrderWhatsAppMessage,
} from "@/components/whatsapp-button";
import { useStore } from "@/components/store-provider";

export function BookingsClient() {
  const store = useStore();
  const products = store.products;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    pickupDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
    pickupTime: "15:00",
    productId: "",
    quantity: 20,
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const bookings = [...store.bookings].sort((a, b) =>
    `${a.pickupDate}${a.pickupTime}`.localeCompare(`${b.pickupDate}${b.pickupTime}`),
  );
  const todayBookings = bookings.filter((b) => b.pickupDate === today);
  const productId = form.productId || products[0]?.id || "";

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const branchId = store.branchId || store.branches[0]?.id;
    if (!branchId || !productId) return;
    store.addBooking({
      branchId,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
      items: [{ productId, quantity: form.quantity }],
    });
    setShowForm(false);
    setForm({ ...form, customerName: "", customerPhone: "" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="mt-1 text-slate-500">
            Manage pickup reservations and schedules
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
        >
          <h2 className="font-semibold text-emerald-900">Create New Booking</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input
              placeholder="Customer Name"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            <input
              placeholder="Phone (012-xxxxxxx)"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              required
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            <input
              type="date"
              value={form.pickupDate}
              onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            <input
              type="time"
              value={form.pickupTime}
              onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            <select
              value={productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name} - RM{p.price}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: parseInt(e.target.value) })
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              placeholder="Quantity"
            />
          </div>
          <button
            type="submit"
            className="mt-4 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Create Booking (auto-deducts inventory)
          </button>
        </form>
      )}

      {todayBookings.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Today&apos;s Bookings
          </h2>
          <div className="mt-4 space-y-2">
            {todayBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-600">
                  {b.pickupTime.slice(0, 5)}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {b.items.reduce((s, i) => s + i.quantity, 0)} drinks
                </span>
                <span className="text-sm text-slate-500">{b.customerName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((booking) => {
          const statusBadge = getBookingStatusBadge(booking.status);
          const totalDrinks = booking.items.reduce(
            (s, i) => s + i.quantity,
            0,
          );

          return (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">
                      Booking #{booking.bookingNumber}
                    </span>
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Customer: {booking.customerName}
                  </p>
                  <p className="text-sm text-slate-500">
                    Pickup: {format(new Date(booking.pickupDate), "dd MMM yyyy")}{" "}
                    {booking.pickupTime.slice(0, 5)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Items: {totalDrinks} drinks
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(booking.total)}
                </p>
              </div>

              <div className="mt-3">
                {booking.items.map((item, i) => (
                  <p key={i} className="text-sm text-slate-600">
                    {item.productName} x {item.quantity}
                  </p>
                ))}
              </div>

              {booking.customerPhone && (
                <div className="mt-4">
                  <WhatsAppButton
                    phone={booking.customerPhone}
                    message={generateOrderWhatsAppMessage({
                      orderNumber: booking.bookingNumber,
                      customerName: booking.customerName,
                      total: booking.total,
                      pickupDate: format(
                        new Date(booking.pickupDate),
                        "dd MMM yyyy",
                      ),
                      pickupTime: booking.pickupTime,
                    })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
