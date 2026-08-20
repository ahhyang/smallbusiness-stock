import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { OrdersClient } from "@/components/orders/orders-client";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <OrdersClient />;
}
