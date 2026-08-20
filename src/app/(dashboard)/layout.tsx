import { redirect } from "next/navigation";
import { getSession, getBranchId } from "@/lib/auth";
import { getBusinessContext } from "@/lib/data";
import { StoreProvider } from "@/components/store-provider";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const branchId = await getBranchId();
  const context = await getBusinessContext(branchId);

  return (
    <StoreProvider initialBranchId={branchId || context.activeBranchId}>
      <AppShell businessName={context.businessName} userName={session.name}>
        {children}
      </AppShell>
    </StoreProvider>
  );
}
