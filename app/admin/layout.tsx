import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminUnauthorized } from "@/components/admin/AdminUnauthorized";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") return <AdminUnauthorized email={user.email} />;

  return <AdminShell>{children}</AdminShell>;
}
