"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User } from "lucide-react";
import { SUGGESTED_QUESTIONS } from "@/lib/ai/constants";
import { useStore } from "@/components/store-provider";
import { format } from "date-fns";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AIClient() {
  const store = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "你好！我是 SmartStore AI（OpenRouter）。我会结合当前库存、订单和预订数据回答。库存不足时也会主动弹窗提醒。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function buildContext() {
    const today = format(new Date(), "yyyy-MM-dd");
    return {
      todaySales: store.todaySales,
      todayOrderCount: store.todayOrderCount,
      pendingCount: store.pendingCount,
      todayBookingCount: store.todayBookingCount,
      lowCount: store.lowCount,
      outCount: store.outCount,
      lowStock: store.inventory
        .filter((i) => i.currentQty <= i.minimumQty)
        .map((i) => ({
          name: i.name,
          currentQty: i.currentQty,
          minimumQty: i.minimumQty,
          unit: i.unit,
        })),
      popularProducts: store.popularProducts.map((p) => ({
        name: p.name,
        count: p.count,
      })),
      todayBookings: store.bookings
        .filter((b) => b.pickupDate === today)
        .map((b) => ({
          customerName: b.customerName,
          pickupTime: b.pickupTime.slice(0, 5),
          drinks: b.items.reduce((s, i) => s + i.quantity, 0),
        })),
      pendingOrders: store.orders
        .filter((o) =>
          ["pending", "confirmed", "preparing", "ready"].includes(o.status),
        )
        .slice(0, 8)
        .map((o) => ({
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          status: o.status,
          total: o.total,
        })),
    };
  }

  async function sendMessage(query: string) {
    if (!query.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          branchId: store.branchId,
          context: buildContext(),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "Sorry, I could not answer that right now.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Please try again in a moment.",
        },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
        <p className="mt-1 text-slate-500">
          Powered by OpenRouter · live store data
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-slate-200 text-slate-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <Bot className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                Thinking with OpenRouter...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your store..."
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
