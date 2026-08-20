import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AIClient } from "@/components/ai/ai-client";

export default async function AIPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <AIClient />;
}
