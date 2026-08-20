import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BookingsClient } from "@/components/bookings/bookings-client";

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <BookingsClient />;
}
