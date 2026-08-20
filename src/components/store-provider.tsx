"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DemoStore,
  type DemoBooking,
  type DemoInventoryItem,
  type DemoOrder,
  type DemoProduct,
} from "@/lib/demo-store";
import {
  buildAlerts,
  buildBriefing,
  mergeAlerts,
  type StoreAlert,
} from "@/lib/alerts";

const STORAGE_KEY = "smartstore-state-v1";
const BRIEFING_KEY = "smartstore-briefing-date";

type StoreContextValue = {
  ready: boolean;
  branchId: string | null;
  setBranchId: (id: string) => void;
  inventory: DemoInventoryItem[];
  products: DemoProduct[];
  orders: DemoOrder[];
  bookings: DemoBooking[];
  customers: DemoStore["customers"];
  branches: DemoStore["branches"];
  alerts: StoreAlert[];
  unreadCount: number;
  toast: StoreAlert | null;
  popup: StoreAlert | null;
  dismissToast: () => void;
  dismissPopup: () => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  addBooking: (data: Parameters<DemoStore["addBooking"]>[0]) => DemoBooking;
  createOrder: (data: Parameters<DemoStore["createOrder"]>[0]) => DemoOrder;
  updateOrderStatus: (orderId: string, status: DemoOrder["status"]) => void;
  stockIn: (data: Parameters<DemoStore["stockIn"]>[0]) => void;
  adjustStock: (data: Parameters<DemoStore["adjustStock"]>[0]) => void;
  todaySales: number;
  todayOrderCount: number;
  pendingCount: number;
  todayBookingCount: number;
  lowCount: number;
  outCount: number;
  hourlySales: { hour: string; sales: number }[];
  popularProducts: { name: string; emoji: string; count: number }[];
};

const StoreContext = createContext<StoreContextValue | null>(null);

function hydrateStore(): DemoStore {
  const store = new DemoStore();
  if (typeof window === "undefined") return store;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return store;
    const parsed = JSON.parse(raw) as Partial<DemoStore>;
    if (parsed.inventory) store.inventory = parsed.inventory;
    if (parsed.products) store.products = parsed.products;
    if (parsed.customers) store.customers = parsed.customers;
    if (parsed.orders) store.orders = parsed.orders;
    if (parsed.bookings) store.bookings = parsed.bookings;
    if (parsed.transactions) store.transactions = parsed.transactions;
  } catch {
    /* keep seed */
  }
  return store;
}

function persistStore(store: DemoStore) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      inventory: store.inventory,
      products: store.products,
      customers: store.customers,
      orders: store.orders,
      bookings: store.bookings,
      transactions: store.transactions,
    }),
  );
}

function pushBrowserNotification(alert: StoreAlert) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(alert.title, { body: alert.message, tag: alert.key });
  } catch {
    /* ignore */
  }
}

export function StoreProvider({
  children,
  initialBranchId,
}: {
  children: React.ReactNode;
  initialBranchId: string | null;
}) {
  const storeRef = useRef<DemoStore>(new DemoStore());
  const [ready, setReady] = useState(false);
  const [branchId, setBranchIdState] = useState<string | null>(initialBranchId);
  const [version, setVersion] = useState(0);
  const [alerts, setAlerts] = useState<StoreAlert[]>([]);
  const [toast, setToast] = useState<StoreAlert | null>(null);
  const [popup, setPopup] = useState<StoreAlert | null>(null);

  const refresh = useCallback(() => {
    persistStore(storeRef.current);
    setVersion((v) => v + 1);
  }, []);

  const runAlerts = useCallback(
    (opts?: { briefing?: boolean }) => {
      const store = storeRef.current;
      const generated = buildAlerts({
        branchId,
        inventory: store.inventory,
        orders: store.orders,
        bookings: store.bookings,
      });
      setAlerts((prev) => {
        const { alerts: next, fresh } = mergeAlerts(prev, generated);
        const critical = fresh.filter((a) => a.severity === "critical");
        const other = fresh.filter((a) => a.severity !== "critical");
        if (critical[0]) {
          setPopup(critical[0]);
          pushBrowserNotification(critical[0]);
        } else if (other[0]) {
          setToast(other[0]);
          pushBrowserNotification(other[0]);
        }
        return next;
      });

      if (opts?.briefing) {
        const today = new Date().toISOString().slice(0, 10);
        if (sessionStorage.getItem(BRIEFING_KEY) !== today) {
          sessionStorage.setItem(BRIEFING_KEY, today);
          const briefing = buildBriefing({
            todaySales: store.getTodaySales(branchId),
            orderCount: store.getTodayOrders(branchId).length,
            pendingCount: store.getPendingOrders(branchId).length,
            bookingCount: store.getTodayBookings(branchId).length,
            lowCount: store.getLowStock(branchId).length,
            outCount: store.getOutOfStock(branchId).length,
          });
          setPopup(briefing);
          setAlerts((prev) => [briefing, ...prev]);
        }
      }
    },
    [branchId],
  );

  useEffect(() => {
    storeRef.current = hydrateStore();
    setReady(true);
    setVersion((v) => v + 1);
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    runAlerts({ briefing: true });
  }, [ready, runAlerts]);

  const mutate = useCallback(
    (fn: (store: DemoStore) => void, eventAlert?: StoreAlert) => {
      fn(storeRef.current);
      refresh();
      if (eventAlert) {
        setAlerts((prev) => [eventAlert, ...prev]);
        if (eventAlert.severity === "critical") setPopup(eventAlert);
        else setToast(eventAlert);
        pushBrowserNotification(eventAlert);
      }
      runAlerts();
    },
    [refresh, runAlerts],
  );

  const store = storeRef.current;
  void version;

  const value = useMemo<StoreContextValue>(() => {
    const filteredInventory = store.inventory.filter(
      (i) => !branchId || i.branchId === branchId,
    );
    const filteredOrders = store.orders.filter(
      (o) => !branchId || o.branchId === branchId,
    );
    const filteredBookings = store.bookings.filter(
      (b) => !branchId || b.branchId === branchId,
    );
    const filteredProducts = store.products.filter(
      (p) => !branchId || p.branchId === branchId,
    );

    return {
      ready,
      branchId,
      setBranchId: (id: string) => {
        setBranchIdState(id || null);
        fetch("/api/branch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branchId: id }),
        }).catch(() => undefined);
      },
      inventory: filteredInventory,
      products: filteredProducts,
      orders: filteredOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      bookings: filteredBookings,
      customers: store.customers,
      branches: store.branches,
      alerts,
      unreadCount: alerts.filter((a) => !a.read).length,
      toast,
      popup,
      dismissToast: () => setToast(null),
      dismissPopup: () => setPopup(null),
      markAllRead: () =>
        setAlerts((prev) => prev.map((a) => ({ ...a, read: true }))),
      markRead: (id: string) =>
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
        ),
      addBooking: (data) => {
        let booking!: DemoBooking;
        mutate((s) => {
          booking = s.addBooking(data);
        }, {
          id: `event-booking-${Date.now()}`,
          key: `event:booking:${Date.now()}`,
          kind: "new_event",
          severity: "info",
          title: "New booking created",
          message: `AI: Pickup reserved for ${data.customerName}. Ingredients were deducted automatically from inventory.`,
          href: "/bookings",
          createdAt: new Date().toISOString(),
          read: false,
        });
        return booking;
      },
      createOrder: (data) => {
        let order!: DemoOrder;
        mutate((s) => {
          order = s.createOrder(data);
        }, {
          id: `event-order-${Date.now()}`,
          key: `event:order:${Date.now()}`,
          kind: "new_event",
          severity: "info",
          title: "New walk-in order",
          message: "AI: Order created and ingredients deducted from inventory.",
          href: "/orders",
          createdAt: new Date().toISOString(),
          read: false,
        });
        return order;
      },
      updateOrderStatus: (orderId, status) => {
        mutate((s) => {
          s.updateOrderStatus(orderId, status);
        });
      },
      stockIn: (data) => {
        mutate((s) => {
          s.stockIn(data);
        }, {
          id: `event-stockin-${Date.now()}`,
          key: `event:stockin:${Date.now()}`,
          kind: "new_event",
          severity: "info",
          title: "Stock received",
          message: "AI: Inventory updated. Low-stock alerts will clear if this item is back above minimum.",
          href: "/inventory",
          createdAt: new Date().toISOString(),
          read: false,
        });
      },
      adjustStock: (data) => {
        mutate((s) => {
          s.adjustStock(data);
        }, {
          id: `event-adjust-${Date.now()}`,
          key: `event:adjust:${Date.now()}`,
          kind: "new_event",
          severity: data.quantity < 0 ? "warning" : "info",
          title: "Stock adjusted",
          message: `AI: Adjustment recorded (${data.reason}). This is visible in history so staff waste can be reviewed later.`,
          href: "/inventory",
          createdAt: new Date().toISOString(),
          read: false,
        });
      },
      todaySales: store.getTodaySales(branchId),
      todayOrderCount: store.getTodayOrders(branchId).length,
      pendingCount: store.getPendingOrders(branchId).length,
      todayBookingCount: store.getTodayBookings(branchId).length,
      lowCount: store.getLowStock(branchId).length,
      outCount: store.getOutOfStock(branchId).length,
      hourlySales: store.getHourlySales(branchId),
      popularProducts: store.getPopularProducts(branchId),
    };
  }, [alerts, branchId, mutate, popup, ready, store, toast]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
