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
  const booking = store.addBooking({
    branchId: body.branchId || branchId!,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    pickupDate: body.pickupDate,
    pickupTime: body.pickupTime,
    items: body.items,
  });

  return NextResponse.json({ booking });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const branchId = await getBranchId();
  const store = getDemoStore();
  const bookings = store.bookings.filter(
    (b) => !branchId || b.branchId === branchId,
  );

  return NextResponse.json({ bookings });
}
