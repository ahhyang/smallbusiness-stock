import { redirect } from "next/navigation";
import { getSession, getBranchId } from "@/lib/auth";
import { getSalesReport } from "@/lib/data";
import { SalesClient } from "@/components/sales/sales-client";

export default async function SalesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const branchId = await getBranchId();
  const data = await getSalesReport(branchId, "month");

  return <SalesClient initialData={data} />;
}
