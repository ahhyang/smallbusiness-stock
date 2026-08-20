import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProductsClient } from "@/components/products/products-client";

export default async function ProductsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <ProductsClient />;
}
