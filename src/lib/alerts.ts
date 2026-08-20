import { format } from "date-fns";
import type {
  DemoBooking,
  DemoInventoryItem,
  DemoOrder,
} from "@/lib/demo-store";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertKind =
  | "out_of_stock"
  | "low_stock"
  | "pending_orders"
  | "booking_soon"
  | "new_event"
  | "briefing";

export type StoreAlert = {
  id: string;
  key: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  read: boolean;
};

export function buildAlerts(input: {
  branchId?: string | null;
  inventory: DemoInventoryItem[];
  orders: DemoOrder[];
  bookings: DemoBooking[];
}): StoreAlert[] {
  const { branchId } = input;
  const now = new Date().toISOString();
  const today = format(new Date(), "yyyy-MM-dd");
  const alerts: StoreAlert[] = [];

  const inventory = input.inventory.filter(
    (i) => !branchId || i.branchId === branchId,
  );
  const orders = input.orders.filter((o) => !branchId || o.branchId === branchId);
  const bookings = input.bookings.filter(
    (b) => !branchId || b.branchId === branchId,
  );

  const out = inventory.filter((i) => i.currentQty <= 0);
  const low = inventory.filter(
    (i) => i.currentQty > 0 && i.currentQty <= i.minimumQty,
  );
  const pending = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "ready"].includes(o.status),
  );
  const todayBookings = bookings.filter(
    (b) =>
      b.pickupDate === today &&
      ["pending", "confirmed", "ready"].includes(b.status),
  );

  for (const item of out) {
    alerts.push({
      id: `out-${item.id}`,
      key: `out:${item.id}`,
      kind: "out_of_stock",
      severity: "critical",
      title: `${item.name} is out of stock`,
      message: `AI: ${item.name} is at 0 ${item.unit}. Open Inventory or Suppliers, then tap WhatsApp restock — the message is already typed, you only click Send.`,
      href: "/suppliers",
      createdAt: now,
      read: false,
    });
  }

  for (const item of low) {
    alerts.push({
      id: `low-${item.id}`,
      key: `low:${item.id}`,
      kind: "low_stock",
      severity: "warning",
      title: `${item.name} is running low`,
      message: `AI: ${item.name} is ${item.currentQty}${item.unit} / min ${item.minimumQty}${item.unit}. Tap WhatsApp restock — the order message is already typed, you only click Send. Or copy the message.`,
      href: "/suppliers",
      createdAt: now,
      read: false,
    });
  }

  if (pending.length >= 3) {
    alerts.push({
      id: `pending-${pending.length}`,
      key: `pending:${pending.length > 7 ? "high" : "mid"}`,
      kind: "pending_orders",
      severity: pending.length >= 7 ? "warning" : "info",
      title: `${pending.length} orders still need action`,
      message: `AI: Staff have ${pending.length} open orders. Move Ready tickets first so pickup customers are not waiting at the counter.`,
      href: "/orders",
      createdAt: now,
      read: false,
    });
  }

  for (const booking of todayBookings) {
    const drinks = booking.items.reduce((s, i) => s + i.quantity, 0);
    alerts.push({
      id: `booking-${booking.id}`,
      key: `booking:${booking.id}`,
      kind: "booking_soon",
      severity: "info",
      title: `Pickup ${booking.pickupTime.slice(0, 5)} — ${booking.customerName}`,
      message: `AI: ${booking.customerName} is collecting ${drinks} drinks at ${booking.pickupTime.slice(0, 5)}. Confirm ingredients are reserved and send a WhatsApp reminder if needed.`,
      href: "/bookings",
      createdAt: now,
      read: false,
    });
  }

  return alerts;
}

export function buildBriefing(input: {
  todaySales: number;
  orderCount: number;
  pendingCount: number;
  bookingCount: number;
  lowCount: number;
  outCount: number;
}): StoreAlert {
  const parts = [
    `Today's sales are RM ${input.todaySales.toFixed(2)} from ${input.orderCount} orders.`,
    input.pendingCount
      ? `${input.pendingCount} orders still need handling.`
      : "No pending counter orders.",
    input.bookingCount
      ? `${input.bookingCount} pickups today.`
      : "No pickups scheduled today.",
    input.outCount
      ? `${input.outCount} items are sold out.`
      : input.lowCount
        ? `${input.lowCount} items are below minimum stock.`
        : "Inventory looks healthy.",
  ];

  return {
    id: `briefing-${format(new Date(), "yyyy-MM-dd")}`,
    key: `briefing:${format(new Date(), "yyyy-MM-dd")}`,
    kind: "briefing",
    severity: input.outCount > 0 ? "critical" : input.lowCount > 0 ? "warning" : "info",
    title: "AI morning briefing",
    message: `AI: ${parts.join(" ")}`,
    href: "/dashboard",
    createdAt: new Date().toISOString(),
    read: false,
  };
}

export function mergeAlerts(
  existing: StoreAlert[],
  next: StoreAlert[],
): { alerts: StoreAlert[]; fresh: StoreAlert[] } {
  const byKey = new Map(existing.map((a) => [a.key, a]));
  const fresh: StoreAlert[] = [];

  for (const alert of next) {
    const prev = byKey.get(alert.key);
    if (!prev) {
      byKey.set(alert.key, alert);
      fresh.push(alert);
    }
  }

  const liveKeys = new Set(next.map((a) => a.key));
  const alerts = [...byKey.values()]
    .filter((a) => a.kind === "briefing" || a.kind === "new_event" || liveKeys.has(a.key))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { alerts, fresh };
}
