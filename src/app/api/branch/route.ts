import { NextRequest, NextResponse } from "next/server";
import { setBranchCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { branchId } = await request.json();
  if (!branchId) {
    return NextResponse.json({ error: "Branch ID required" }, { status: 400 });
  }
  await setBranchCookie(branchId);
  return NextResponse.json({ success: true });
}
