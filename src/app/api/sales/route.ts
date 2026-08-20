import { NextRequest, NextResponse } from "next/server";
import { getSession, getBranchId } from "@/lib/auth";
import { getSalesReport } from "@/lib/data";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const branchId = await getBranchId();
  const period = (request.nextUrl.searchParams.get("period") || "month") as
    | "today"
    | "week"
    | "month";

  const data = await getSalesReport(branchId, period);
  return NextResponse.json(data);
}
