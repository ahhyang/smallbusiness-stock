import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { InventoryClient } from "@/components/inventory/inventory-client";
import { Suspense } from "react";

export default async function InventoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <Suspense fallback={<p className="text-slate-500">Loading inventory…</p>}>
      <InventoryClient />
    </Suspense>
  );
}
