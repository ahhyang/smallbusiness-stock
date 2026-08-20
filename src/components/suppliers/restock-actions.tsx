"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  WhatsAppButton,
  generateSupplierRestockMessage,
  suggestedRestockQty,
} from "@/components/whatsapp-button";
import type { DemoInventoryItem, DemoSupplier } from "@/lib/demo-store";

export function SupplierRestockActions({
  item,
  supplier,
  branchName,
  compact = false,
}: {
  item: DemoInventoryItem;
  supplier?: DemoSupplier;
  branchName?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (!supplier) {
    return (
      <a
        href="/suppliers"
        className="text-xs font-medium text-emerald-700 hover:underline"
      >
        Add supplier WhatsApp
      </a>
    );
  }

  const qty = suggestedRestockQty(item.currentQty, item.minimumQty);
  const message = generateSupplierRestockMessage({
    supplierName: supplier.name,
    itemName: item.name,
    unit: item.unit,
    currentQty: item.currentQty,
    minimumQty: item.minimumQty,
    branchName,
    quantity: qty,
  });

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "mt-3 space-y-2"}>
      {!compact && (
        <p className="text-xs text-slate-500">
          {supplier.name} · {supplier.whatsapp || supplier.phone}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <WhatsAppButton
          phone={supplier.whatsapp || supplier.phone}
          message={message}
          label={compact ? "WhatsApp" : "WhatsApp restock"}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#20BD5A]"
        />
        <button
          type="button"
          onClick={copyMessage}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy message"}
        </button>
      </div>
    </div>
  );
}
