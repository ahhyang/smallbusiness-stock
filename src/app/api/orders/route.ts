import { NextRequest, NextResponse } from "next/server";
import { getSession, getBranchId } from "@/lib/auth";
import { getDemoStore } from "@/lib/demo-store";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, status } = await request.json();
  const store = getDemoStore();
  const order = store.updateOrderStatus(orderId, status);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const branchId = await getBranchId();
  const status = request.nextUrl.searchParams.get("status") || "all";
  const store = getDemoStore();

  let orders = store.orders.filter((o) => !branchId || o.branchId === branchId);
  if (status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }

  return NextResponse.json({
    orders: orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  });
}
