type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type StoreContextPayload = {
  todaySales: number;
  todayOrderCount: number;
  pendingCount: number;
  todayBookingCount: number;
  lowCount: number;
  outCount: number;
  lowStock: { name: string; currentQty: number; minimumQty: number; unit: string }[];
  popularProducts: { name: string; count: number }[];
  todayBookings: {
    customerName: string;
    pickupTime: string;
    drinks: number;
  }[];
  pendingOrders: {
    orderNumber: string;
    customerName?: string;
    status: string;
    total: number;
  }[];
};

export async function askOpenRouter(
  query: string,
  context: StoreContextPayload,
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const system = `You are SmartStore AI, a practical assistant for a small F&B / drink shop owner in Malaysia (currency RM).
Answer in the same language the owner uses (Chinese or English).
Be concise, actionable, and use the live store data below. Do not invent inventory numbers.
If data is missing, say what you can see and suggest a next step.

Live store snapshot:
${JSON.stringify(context, null, 2)}`;

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: query },
  ];

  const model =
    process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://smartstore-demo-pi.vercel.app",
      "X-Title": "SmartStore",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenRouter error:", res.status, text);
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}
