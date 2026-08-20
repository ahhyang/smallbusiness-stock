import { format, subDays, startOfDay, addHours } from "date-fns";

export type DemoBranch = {
  id: string;
  name: string;
  address: string;
};

export type DemoInventoryItem = {
  id: string;
  branchId: string;
  name: string;
  type: "raw" | "finished";
  unit: string;
  currentQty: number;
  minimumQty: number;
};

export type DemoProduct = {
  id: string;
  branchId: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  ingredients: { inventoryItemId: string; quantity: number }[];
};

export type DemoCustomer = {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
};

export type DemoOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type DemoOrder = {
  id: string;
  branchId: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  paymentMethod: "cash" | "qr" | "online_transfer";
  paymentStatus: "pending" | "paid";
  total: number;
  items: DemoOrderItem[];
  createdAt: string;
};

export type DemoBooking = {
  id: string;
  branchId: string;
  bookingNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  total: number;
  items: DemoOrderItem[];
  createdAt: string;
};

export type DemoTransaction = {
  id: string;
  branchId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  type: "stock_in" | "adjustment" | "sale" | "booking_reserve";
  quantity: number;
  reason?: string;
  cost?: number;
  supplier?: string;
  createdAt: string;
};

const BUSINESS_ID = "biz-001";
const BRANCH_IMAGO = "branch-imago";
const BRANCH_KK = "branch-kk";
const BRANCH_SURIA = "branch-suria";

const RAW_IDS = {
  mango: "inv-mango",
  milk: "inv-milk",
  sugar: "inv-sugar",
  tea: "inv-tea",
  pearls: "inv-pearls",
  ice: "inv-ice",
  cup: "inv-cup",
  straw: "inv-straw",
  coffee: "inv-coffee",
};

const PRODUCT_IDS = {
  mangoSmoothie: "prod-mango-smoothie",
  brownSugarMilkTea: "prod-brown-sugar",
  peachTea: "prod-peach-tea",
  americano: "prod-americano",
};

function createInventoryForBranch(branchId: string): DemoInventoryItem[] {
  return [
    { id: `${RAW_IDS.mango}-${branchId}`, branchId, name: "Mango", type: "raw", unit: "kg", currentQty: 8.5, minimumQty: 10 },
    { id: `${RAW_IDS.milk}-${branchId}`, branchId, name: "Milk", type: "raw", unit: "L", currentQty: 6, minimumQty: 10 },
    { id: `${RAW_IDS.sugar}-${branchId}`, branchId, name: "Sugar", type: "raw", unit: "kg", currentQty: 15, minimumQty: 5 },
    { id: `${RAW_IDS.tea}-${branchId}`, branchId, name: "Tea", type: "raw", unit: "kg", currentQty: 4, minimumQty: 3 },
    { id: `${RAW_IDS.pearls}-${branchId}`, branchId, name: "Pearls", type: "raw", unit: "kg", currentQty: 2, minimumQty: 5 },
    { id: `${RAW_IDS.ice}-${branchId}`, branchId, name: "Ice", type: "raw", unit: "kg", currentQty: 20, minimumQty: 10 },
    { id: `${RAW_IDS.cup}-${branchId}`, branchId, name: "Cup", type: "raw", unit: "pcs", currentQty: 120, minimumQty: 500 },
    { id: `${RAW_IDS.straw}-${branchId}`, branchId, name: "Straw", type: "raw", unit: "pcs", currentQty: 80, minimumQty: 300 },
    { id: `${RAW_IDS.coffee}-${branchId}`, branchId, name: "Coffee Beans", type: "raw", unit: "kg", currentQty: 0, minimumQty: 2 },
  ];
}

function createProductsForBranch(branchId: string): DemoProduct[] {
  const inv = (key: keyof typeof RAW_IDS) => `${RAW_IDS[key]}-${branchId}`;
  return [
    {
      id: `${PRODUCT_IDS.mangoSmoothie}-${branchId}`,
      branchId,
      name: "Mango Smoothie",
      price: 8.9,
      category: "Smoothie",
      emoji: "🥤",
      ingredients: [
        { inventoryItemId: inv("mango"), quantity: 0.1 },
        { inventoryItemId: inv("milk"), quantity: 0.15 },
        { inventoryItemId: inv("sugar"), quantity: 0.02 },
        { inventoryItemId: inv("ice"), quantity: 0.05 },
        { inventoryItemId: inv("cup"), quantity: 1 },
        { inventoryItemId: inv("straw"), quantity: 1 },
      ],
    },
    {
      id: `${PRODUCT_IDS.brownSugarMilkTea}-${branchId}`,
      branchId,
      name: "Brown Sugar Pearl Milk Tea",
      price: 9.5,
      category: "Milk Tea",
      emoji: "🧋",
      ingredients: [
        { inventoryItemId: inv("milk"), quantity: 0.2 },
        { inventoryItemId: inv("tea"), quantity: 0.01 },
        { inventoryItemId: inv("sugar"), quantity: 0.03 },
        { inventoryItemId: inv("pearls"), quantity: 0.05 },
        { inventoryItemId: inv("ice"), quantity: 0.03 },
        { inventoryItemId: inv("cup"), quantity: 1 },
        { inventoryItemId: inv("straw"), quantity: 1 },
      ],
    },
    {
      id: `${PRODUCT_IDS.peachTea}-${branchId}`,
      branchId,
      name: "Peach Tea",
      price: 7.5,
      category: "Tea",
      emoji: "🍑",
      ingredients: [
        { inventoryItemId: inv("tea"), quantity: 0.01 },
        { inventoryItemId: inv("sugar"), quantity: 0.02 },
        { inventoryItemId: inv("ice"), quantity: 0.04 },
        { inventoryItemId: inv("cup"), quantity: 1 },
        { inventoryItemId: inv("straw"), quantity: 1 },
      ],
    },
    {
      id: `${PRODUCT_IDS.americano}-${branchId}`,
      branchId,
      name: "Americano",
      price: 6.5,
      category: "Coffee",
      emoji: "☕",
      ingredients: [
        { inventoryItemId: inv("coffee"), quantity: 0.015 },
        { inventoryItemId: inv("cup"), quantity: 1 },
      ],
    },
  ];
}

function generateTodayOrders(branchId: string): DemoOrder[] {
  const today = new Date();
  const orders: DemoOrder[] = [];
  const statuses: DemoOrder["status"][] = [
    "completed", "completed", "completed", "completed", "completed",
    "preparing", "ready", "pending", "confirmed", "completed",
  ];

  for (let i = 0; i < 84; i++) {
    const hour = 8 + Math.floor((i / 84) * 12);
    const createdAt = addHours(startOfDay(today), hour + (i % 3) * 0.2);
    const productIdx = i % 4;
    const products = createProductsForBranch(branchId);
    const product = products[productIdx];
    const qty = 1 + (i % 3);
    const status = i < 7 ? statuses[i % 4 + 4] : "completed";

    orders.push({
      id: `order-${branchId}-${i}`,
      branchId,
      orderNumber: `${1000 + i}`,
      customerName: ["John", "Sarah", "David", "Emily", "Alex"][i % 5],
      status: i < 7 ? (["pending", "confirmed", "preparing", "ready", "pending", "preparing", "ready"][i] as DemoOrder["status"]) : status,
      paymentMethod: ["cash", "qr", "online_transfer"][i % 3] as DemoOrder["paymentMethod"],
      paymentStatus: i < 7 ? "pending" : "paid",
      total: product.price * qty,
      items: [{ productId: product.id, productName: product.name, quantity: qty, unitPrice: product.price }],
      createdAt: createdAt.toISOString(),
    });
  }
  return orders;
}

export class DemoStore {
  businessId = BUSINESS_ID;
  businessName = "Mixue Sabah";
  branches: DemoBranch[] = [
    { id: BRANCH_IMAGO, name: "Imago Branch", address: "Imago Shopping Mall, KK" },
    { id: BRANCH_KK, name: "KK Times Square", address: "KK Times Square, Kota Kinabalu" },
    { id: BRANCH_SURIA, name: "Suria Sabah", address: "Suria Sabah, Kota Kinabalu" },
  ];

  inventory: DemoInventoryItem[] = [
    ...createInventoryForBranch(BRANCH_IMAGO),
    ...createInventoryForBranch(BRANCH_KK),
    ...createInventoryForBranch(BRANCH_SURIA),
  ];

  products: DemoProduct[] = [
    ...createProductsForBranch(BRANCH_IMAGO),
    ...createProductsForBranch(BRANCH_KK),
    ...createProductsForBranch(BRANCH_SURIA),
  ];

  customers: DemoCustomer[] = [
    { id: "cust-john", name: "John", phone: "012-3456789", totalOrders: 28, totalSpent: 428, lastOrder: format(new Date(), "dd MMM yyyy") },
    { id: "cust-sarah", name: "Sarah", phone: "012-9876543", totalOrders: 24, totalSpent: 390, lastOrder: format(subDays(new Date(), 1), "dd MMM yyyy") },
    { id: "cust-david", name: "David", phone: "013-5551234", totalOrders: 20, totalSpent: 320, lastOrder: format(subDays(new Date(), 2), "dd MMM yyyy") },
    { id: "cust-emily", name: "Emily", phone: "014-7778899", totalOrders: 15, totalSpent: 245, lastOrder: format(subDays(new Date(), 3), "dd MMM yyyy") },
  ];

  orders: DemoOrder[] = [
    ...generateTodayOrders(BRANCH_IMAGO),
    ...generateTodayOrders(BRANCH_KK).slice(0, 40),
    ...generateTodayOrders(BRANCH_SURIA).slice(0, 30),
  ];

  bookings: DemoBooking[] = [
    {
      id: "booking-1028",
      branchId: BRANCH_IMAGO,
      bookingNumber: "1028",
      customerId: "cust-john",
      customerName: "John",
      customerPhone: "012-3456789",
      pickupDate: format(addHours(new Date(), 48), "yyyy-MM-dd"),
      pickupTime: "15:00",
      status: "confirmed",
      total: 85,
      items: [{ productId: `${PRODUCT_IDS.mangoSmoothie}-${BRANCH_IMAGO}`, productName: "Mango Smoothie", quantity: 10, unitPrice: 8.5 }],
      createdAt: new Date().toISOString(),
    },
    {
      id: "booking-1029",
      branchId: BRANCH_IMAGO,
      bookingNumber: "1029",
      customerName: "Sarah",
      customerPhone: "012-9876543",
      pickupDate: format(new Date(), "yyyy-MM-dd"),
      pickupTime: "11:00",
      status: "confirmed",
      total: 95,
      items: [{ productId: `${PRODUCT_IDS.brownSugarMilkTea}-${BRANCH_IMAGO}`, productName: "Brown Sugar Pearl Milk Tea", quantity: 10, unitPrice: 9.5 }],
      createdAt: subDays(new Date(), 1).toISOString(),
    },
    {
      id: "booking-1030",
      branchId: BRANCH_IMAGO,
      bookingNumber: "1030",
      customerName: "David",
      customerPhone: "013-5551234",
      pickupDate: format(new Date(), "yyyy-MM-dd"),
      pickupTime: "13:00",
      status: "confirmed",
      total: 187.5,
      items: [{ productId: `${PRODUCT_IDS.peachTea}-${BRANCH_IMAGO}`, productName: "Peach Tea", quantity: 25, unitPrice: 7.5 }],
      createdAt: subDays(new Date(), 2).toISOString(),
    },
    {
      id: "booking-1031",
      branchId: BRANCH_IMAGO,
      bookingNumber: "1031",
      customerName: "Emily",
      customerPhone: "014-7778899",
      pickupDate: format(new Date(), "yyyy-MM-dd"),
      pickupTime: "15:00",
      status: "pending",
      total: 178,
      items: [{ productId: `${PRODUCT_IDS.mangoSmoothie}-${BRANCH_IMAGO}`, productName: "Mango Smoothie", quantity: 20, unitPrice: 8.9 }],
      createdAt: subDays(new Date(), 1).toISOString(),
    },
    {
      id: "booking-1032",
      branchId: BRANCH_IMAGO,
      bookingNumber: "1032",
      customerName: "Alex",
      customerPhone: "015-3334444",
      pickupDate: format(new Date(), "yyyy-MM-dd"),
      pickupTime: "17:30",
      status: "confirmed",
      total: 142.5,
      items: [{ productId: `${PRODUCT_IDS.brownSugarMilkTea}-${BRANCH_IMAGO}`, productName: "Brown Sugar Pearl Milk Tea", quantity: 15, unitPrice: 9.5 }],
      createdAt: subDays(new Date(), 1).toISOString(),
    },
  ];

  transactions: DemoTransaction[] = [
    {
      id: "tx-1",
      branchId: BRANCH_IMAGO,
      inventoryItemId: `${RAW_IDS.milk}-${BRANCH_IMAGO}`,
      inventoryItemName: "Milk",
      type: "stock_in",
      quantity: 50,
      cost: 150,
      supplier: "ABC Supplier",
      createdAt: format(new Date(), "yyyy-MM-dd'T'08:00:00"),
    },
    {
      id: "tx-2",
      branchId: BRANCH_IMAGO,
      inventoryItemId: `${RAW_IDS.mango}-${BRANCH_IMAGO}`,
      inventoryItemName: "Mango",
      type: "adjustment",
      quantity: -2,
      reason: "Damaged",
      createdAt: format(subDays(new Date(), 1), "yyyy-MM-dd'T'14:00:00"),
    },
  ];

  getLowStock(branchId?: string | null) {
    return this.inventory.filter((item) => {
      if (branchId && item.branchId !== branchId) return false;
      return item.currentQty <= item.minimumQty;
    });
  }

  getOutOfStock(branchId?: string | null) {
    return this.inventory.filter((item) => {
      if (branchId && item.branchId !== branchId) return false;
      return item.currentQty <= 0;
    });
  }

  getTodayOrders(branchId?: string | null) {
    const today = format(new Date(), "yyyy-MM-dd");
    return this.orders.filter((o) => {
      if (branchId && o.branchId !== branchId) return false;
      return o.createdAt.startsWith(today);
    });
  }

  getTodaySales(branchId?: string | null) {
    return this.getTodayOrders(branchId)
      .filter((o) => o.status === "completed" && o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.total, 0);
  }

  getPendingOrders(branchId?: string | null) {
    return this.orders.filter((o) => {
      if (branchId && o.branchId !== branchId) return false;
      return ["pending", "confirmed", "preparing", "ready"].includes(o.status);
    });
  }

  getTodayBookings(branchId?: string | null) {
    const today = format(new Date(), "yyyy-MM-dd");
    return this.bookings.filter((b) => {
      if (branchId && b.branchId !== branchId) return false;
      return b.pickupDate === today;
    });
  }

  getHourlySales(branchId?: string | null) {
    const orders = this.getTodayOrders(branchId).filter(
      (o) => o.status === "completed",
    );
    const hours = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM"];
    const values = [120, 185, 320, 210];
    return hours.map((hour, i) => ({ hour, sales: values[i] }));
  }

  getPopularProducts(branchId?: string | null) {
    const counts: Record<string, { name: string; emoji: string; count: number }> = {};
    for (const order of this.getTodayOrders(branchId)) {
      for (const item of order.items) {
        const product = this.products.find((p) => p.id === item.productId);
        if (!counts[item.productId]) {
          counts[item.productId] = {
            name: item.productName,
            emoji: product?.emoji || "🥤",
            count: 0,
          };
        }
        counts[item.productId].count += item.quantity;
      }
    }
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  deductInventoryForProduct(productId: string, quantity: number) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;

    for (const ing of product.ingredients) {
      const item = this.inventory.find((i) => i.id === ing.inventoryItemId);
      if (item) {
        item.currentQty = Math.max(0, item.currentQty - ing.quantity * quantity);
      }
    }
  }

  addBooking(data: {
    branchId: string;
    customerName: string;
    customerPhone: string;
    pickupDate: string;
    pickupTime: string;
    items: { productId: string; quantity: number }[];
  }) {
    const items: DemoOrderItem[] = data.items.map((item) => {
      const product = this.products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });
    const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const bookingNumber = String(1033 + this.bookings.length);

    const booking: DemoBooking = {
      id: `booking-${Date.now()}`,
      branchId: data.branchId,
      bookingNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      status: "confirmed",
      total,
      items,
      createdAt: new Date().toISOString(),
    };

    this.bookings.push(booking);

    for (const item of data.items) {
      this.deductInventoryForProduct(item.productId, item.quantity);
    }

    const order: DemoOrder = {
      id: `order-booking-${Date.now()}`,
      branchId: data.branchId,
      orderNumber: bookingNumber,
      customerName: data.customerName,
      status: "confirmed",
      paymentMethod: "cash",
      paymentStatus: "pending",
      total,
      items,
      createdAt: new Date().toISOString(),
    };
    this.orders.push(order);

    return booking;
  }

  updateOrderStatus(orderId: string, status: DemoOrder["status"]) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      if (status === "completed") order.paymentStatus = "paid";
    }
    return order;
  }

  createOrder(data: {
    branchId: string;
    customerName: string;
    paymentMethod: DemoOrder["paymentMethod"];
    items: { productId: string; quantity: number }[];
  }) {
    const items: DemoOrderItem[] = data.items.map((item) => {
      const product = this.products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });
    const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const order: DemoOrder = {
      id: `order-${Date.now()}`,
      branchId: data.branchId,
      orderNumber: String(2000 + this.orders.length),
      customerName: data.customerName || "Walk-in",
      status: "pending",
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending",
      total,
      items,
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(order);
    for (const item of data.items) {
      this.deductInventoryForProduct(item.productId, item.quantity);
    }
    return order;
  }

  stockIn(data: {
    branchId: string;
    inventoryItemId: string;
    quantity: number;
    cost?: number;
    supplier?: string;
  }) {
    const item = this.inventory.find(
      (i) => i.id === data.inventoryItemId && i.branchId === data.branchId,
    );
    if (item) {
      item.currentQty += data.quantity;
      this.transactions.unshift({
        id: `tx-${Date.now()}`,
        branchId: data.branchId,
        inventoryItemId: data.inventoryItemId,
        inventoryItemName: item.name,
        type: "stock_in",
        quantity: data.quantity,
        cost: data.cost,
        supplier: data.supplier,
        createdAt: new Date().toISOString(),
      });
    }
    return item;
  }

  adjustStock(data: {
    branchId: string;
    inventoryItemId: string;
    quantity: number;
    reason: string;
  }) {
    const item = this.inventory.find(
      (i) => i.id === data.inventoryItemId && i.branchId === data.branchId,
    );
    if (item) {
      item.currentQty = Math.max(0, item.currentQty + data.quantity);
      this.transactions.unshift({
        id: `tx-${Date.now()}`,
        branchId: data.branchId,
        inventoryItemId: data.inventoryItemId,
        inventoryItemName: item.name,
        type: "adjustment",
        quantity: data.quantity,
        reason: data.reason,
        createdAt: new Date().toISOString(),
      });
    }
    return item;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __demoStore: DemoStore | undefined;
}

export function getDemoStore() {
  if (!global.__demoStore) {
    global.__demoStore = new DemoStore();
  }
  return global.__demoStore;
}

export const DEMO_USER = {
  id: "user-demo",
  email: "demo@store.com",
  password: "demo123",
  name: "Demo Owner",
  role: "owner" as const,
  businessId: BUSINESS_ID,
};

export { BRANCH_IMAGO, BRANCH_KK, BRANCH_SURIA };
