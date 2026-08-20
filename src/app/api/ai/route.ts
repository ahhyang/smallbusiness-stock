import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { askOpenRouter, type StoreContextPayload } from "@/lib/ai/openrouter";
import { processAIQuery } from "@/lib/ai/assistant";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const query = String(body.query || "").trim();
  const context = (body.context || null) as StoreContextPayload | null;

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  if (context) {
    const answer = await askOpenRouter(query, context);
    if (answer) {
      return NextResponse.json({ answer, provider: "openrouter" });
    }
  }

  const fallback = await processAIQuery(query, body.branchId || null);
  return NextResponse.json({ ...fallback, provider: "rules" });
}
