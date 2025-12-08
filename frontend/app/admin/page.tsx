import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // In a real app, you'd check if user is admin
  // For now, we'll allow all authenticated users
  const { data: stats } = await supabase.rpc("get_admin_stats")

  return <AdminDashboard userId={user.id} />
}
