import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/data";
import { createSession } from "@/lib/auth";
import { BRANCH_IMAGO } from "@/lib/demo-store";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession({
      ...user,
      branchId: BRANCH_IMAGO,
    });

    return NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
