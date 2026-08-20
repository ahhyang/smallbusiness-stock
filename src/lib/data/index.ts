import { getDemoStore, DEMO_USER, BRANCH_IMAGO } from "@/lib/demo-store";
import { getDb } from "@/lib/db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import {
  businesses,
  branches,
  inventoryItems,
  products,
  productIngredients,
  orders,
  orderItems,
  bookings,
  bookingItems,
  customers,
} from "@/lib/db/schema";
import { format, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from "date-fns";

export function useDatabase() {
  return !!process.env.DATABASE_URL;
}

export async function getBusinessContext(branchId?: string | null) {
  if (!useDatabase()) {
    const store = getDemoStore();
    const activeBranchId = branchId || BRANCH_IMAGO;
    return {
      businessId: store.businessId,
      businessName: store.businessName,
      branches: store.branches,
      activeBranchId,
    };
  }

  const db = getDb();
  const allBranches = await db.select().from(branches);
  const business = await db.select().from(businesses).limit(1);
  return {
    businessId: business[0]?.id || "",
    businessName: business[0]?.name || "My Business",
    branches: allBranches.map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address || "",
    })),
    activeBranchId: branchId || allBranches[0]?.id || "",
  };
}

export async function getDashboardStats(branchId?: string | null) {
  if (!useDatabase()) {
    const store = getDemoStore();
    const bid = branchId || null;
    return {
      todaySales: store.getTodaySales(bid),
      totalOrders: store.getTodayOrders(bid).length,
      pendingOrders: store.getPendingOrders(bid).length,
      bookings: store.getTodayBookings(bid).length,
      lowStock: store.getLowStock(bid).length,
      outOfStock: store.getOutOfStock(bid).length,
      hourlySales: store.getHourlySales(bid),
      popularProducts: store.getPopularProducts(bid),
    };
  }

  const db = getDb();
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const branchFilter = branchId ? eq(orders.branchId, branchId) : undefined;

  const todayOrdersList = await db
    .select()
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, todayStart),
        lte(orders.createdAt, todayEnd),
        branchFilter,
      ),
    );

  const todaySales = todayOrdersList
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + parseFloat(o.total), 0);

  const pendingOrders = todayOrdersList.filter((o) =>
    ["pending", "confirmed", "preparing", "ready"].includes(o.status),
  ).length;

  const invFilter = branchId ? eq(inventoryItems.branchId, branchId) : undefined;
  const inventory = await db.select().from(inventoryItems).where(invFilter);

  const lowStock = inventory.filter(
    (i) => parseFloat(i.currentQty) <= parseFloat(i.minimumQty) && parseFloat(i.currentQty) > 0,
  ).length;
  const outOfStock = inventory.filter((i) => parseFloat(i.currentQty) <= 0).length;

  const todayStr = format(today, "yyyy-MM-dd");
  const bookingFilter = branchId ? eq(bookings.branchId, branchId) : undefined;
  const todayBookingsList = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.pickupDate, todayStr), bookingFilter));

  return {
    todaySales,
    totalOrders: todayOrdersList.length,
    pendingOrders,
    bookings: todayBookingsList.length,
    lowStock,
    outOfStock,
    hourlySales: [],
    popularProducts: [],
  };
}

export async function getInventory(branchId?: string | null) {
  if (!useDatabase()) {
    const store = getDemoStore();
    return store.inventory.filter((i) => !branchId || i.branchId === branchId);
  }

  const db = getDb();
  if (branchId) {
    return db.select().from(inventoryItems).where(eq(inventoryItems.branchId, branchId));
  }
  return db.select().from(inventoryItems);
}

export async function getProducts(branchId?: string | null) {
  if (!useDatabase()) {
    const store = getDemoStore();
    const prods = store.products.filter((p) => !branchId || p.branchId === branchId);
    return prods.map((p) => ({
      ...p,
      ingredients: p.ingredients.map((ing) => {
        const inv = store.inventory.find((i) => i.id === ing.inventoryItemId);
        return { ...ing, inventoryName: inv?.name || "", unit: inv?.unit || "" };
      }),
    }));
  }

  const db = getDb();
  const filter = branchId ? eq(products.branchId, branchId) : undefined;
  const prods = await db.select().from(products).where(filter);

  const result = [];
  for (const p of prods) {
    const ings = await db
      .select({
        inventoryItemId: productIngredients.inventoryItemId,
        quantity: productIngredients.quantity,
        inventoryName: inventoryItems.name,
        unit: inventoryItems.unit,
      })
      .from(productIngredients)
      .innerJoin(inventoryItems, eq(productIngredients.inventoryItemId, inventoryItems.id))
      .where(eq(productIngredients.productId, p.id));

    result.push({
      id: p.id,
      branchId: p.branchId,
      name: p.name,
      price: parseFloat(p.price),
      category: p.category || "",
      emoji: p.emoji || "🥤",
      ingredients: ings.map((i) => ({
        inventoryItemId: i.inventoryItemId,
        quantity: parseFloat(i.quantity),
        inventoryName: i.inventoryName,
        unit: i.unit,
      })),
    });
  }
  return result;
}

export async function getOrders(branchId?: string | null, status?: string) {
  if (!useDatabase()) {
    const store = getDemoStore();
    let list = store.orders.filter((o) => !branchId || o.branchId === branchId);
    if (status && status !== "all") {
      list = list.filter((o) => o.status === status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const db = getDb();
  const conditions = [];
  if (branchId) conditions.push(eq(orders.branchId, branchId));
  if (status && status !== "all") conditions.push(eq(orders.status, status as "pending"));

  const orderList = await db
    .select()
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));

  const result = [];
  for (const o of orderList) {
    const items = await db
      .select({
        productId: orderItems.productId,
        productName: products.name,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, o.id));

    const customer = o.customerId
      ? await db.select().from(customers).where(eq(customers.id, o.customerId)).limit(1)
      : [];

    result.push({
      id: o.id,
      branchId: o.branchId,
      orderNumber: o.orderNumber,
      customerName: customer[0]?.name,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      total: parseFloat(o.total),
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: parseFloat(i.unitPrice),
      })),
      createdAt: o.createdAt.toISOString(),
    });
  }
  return result;
}

export async function getBookings(branchId?: string | null) {
  if (!useDatabase()) {
    const store = getDemoStore();
    return store.bookings
      .filter((b) => !branchId || b.branchId === branchId)
      .sort((a, b) => {
        const da = `${a.pickupDate}T${a.pickupTime}`;
        const db = `${b.pickupDate}T${b.pickupTime}`;
        return da.localeCompare(db);
      });
  }

  const db = getDb();
  const filter = branchId ? eq(bookings.branchId, branchId) : undefined;
  const list = await db.select().from(bookings).where(filter).orderBy(bookings.pickupDate);

  const result = [];
  for (const b of list) {
    const items = await db
      .select({
        productId: bookingItems.productId,
        productName: products.name,
        quantity: bookingItems.quantity,
        unitPrice: bookingItems.unitPrice,
      })
      .from(bookingItems)
      .innerJoin(products, eq(bookingItems.productId, products.id))
      .where(eq(bookingItems.bookingId, b.id));

    const customer = b.customerId
      ? await db.select().from(customers).where(eq(customers.id, b.customerId)).limit(1)
      : [];

    result.push({
      id: b.id,
      branchId: b.branchId,
      bookingNumber: b.bookingNumber,
      customerId: b.customerId || undefined,
      customerName: customer[0]?.name || "Walk-in",
      customerPhone: customer[0]?.phone || "",
      pickupDate: b.pickupDate,
      pickupTime: b.pickupTime,
      status: b.status,
      total: parseFloat(b.total),
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: parseFloat(i.unitPrice),
      })),
      createdAt: b.createdAt.toISOString(),
    });
  }
  return result;
}

export async function getCustomers() {
  if (!useDatabase()) {
    return getDemoStore().customers;
  }

  const db = getDb();
  const list = await db.select().from(customers);

  const result = [];
  for (const c of list) {
    const custOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, c.id));

    const totalSpent = custOrders.reduce((s, o) => s + parseFloat(o.total), 0);
    const lastOrder = custOrders.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];

    result.push({
      id: c.id,
      name: c.name,
      phone: c.phone || "",
      totalOrders: custOrders.length,
      totalSpent,
      lastOrder: lastOrder ? format(lastOrder.createdAt, "dd MMM yyyy") : "-",
    });
  }
  return result.sort((a, b) => b.totalSpent - a.totalSpent);
}

export async function getSalesReport(
  branchId: string | null | undefined,
  period: "today" | "week" | "month",
) {
  if (!useDatabase()) {
    const store = getDemoStore();
    const multiplier = period === "today" ? 1 : period === "week" ? 7 : 30;
    const todaySales = store.getTodaySales(branchId);
    const totalSales = todaySales * multiplier * 3.2;
    const orderCount = store.getTodayOrders(branchId).length * multiplier * 3;

    const productSales = [
      { name: "Milk Tea", sales: 8200 * (multiplier / 7) },
      { name: "Smoothie", sales: 6400 * (multiplier / 7) },
      { name: "Coffee", sales: 4800 * (multiplier / 7) },
      { name: "Tea", sales: 3200 * (multiplier / 7) },
      { name: "Others", sales: 5820 * (multiplier / 7) },
    ];

    return {
      totalSales,
      orderCount: Math.round(orderCount),
      averageOrder: orderCount > 0 ? totalSales / orderCount : 0,
      productSales,
      comparison: period === "month" ? 14.2 : period === "week" ? 8.5 : 0,
    };
  }

  const db = getDb();
  const now = new Date();
  let start: Date;
  if (period === "today") start = startOfDay(now);
  else if (period === "week") start = startOfWeek(now);
  else start = startOfMonth(now);

  const branchFilter = branchId ? eq(orders.branchId, branchId) : undefined;
  const orderList = await db
    .select()
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, start),
        eq(orders.status, "completed"),
        branchFilter,
      ),
    );

  const totalSales = orderList.reduce((s, o) => s + parseFloat(o.total), 0);
  return {
    totalSales,
    orderCount: orderList.length,
    averageOrder: orderList.length > 0 ? totalSales / orderList.length : 0,
    productSales: [],
    comparison: 0,
  };
}

export async function authenticateUser(email: string, password: string) {
  if (!useDatabase()) {
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      return DEMO_USER;
    }
    return null;
  }

  const db = getDb();
  const { users } = await import("@/lib/db/schema");
  const { verifyPassword } = await import("@/lib/auth");
  const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = userList[0];
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    businessId: user.businessId,
  };
}

export { getDemoStore };
