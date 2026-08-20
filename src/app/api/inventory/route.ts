import { NextRequest, NextResponse } from "next/server";
import { getSession, getBranchId } from "@/lib/auth";
import { getDemoStore } from "@/lib/demo-store";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const branchId = (await getBranchId()) || session.branchId;
  const store = getDemoStore();

  if (body.type === "stock_in") {
    const item = store.stockIn({
      branchId: body.branchId || branchId!,
      inventoryItemId: body.inventoryItemId,
      quantity: body.quantity,
      cost: body.cost,
      supplier: body.supplier,
    });
    return NextResponse.json({ item });
  }

  if (body.type === "adjustment") {
    const item = store.adjustStock({
      branchId: body.branchId || branchId!,
      inventoryItemId: body.inventoryItemId,
      quantity: body.quantity,
      reason: body.reason,
    });
    return NextResponse.json({ item });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const branchId = await getBranchId();
  const store = getDemoStore();
  const inventory = store.inventory.filter(
    (i) => !branchId || i.branchId === branchId,
  );

  return NextResponse.json({ inventory });
}
