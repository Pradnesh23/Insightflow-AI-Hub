import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: datasets } = await supabase.from("datasets").select("*").eq("user_id", user.id)

  return <DashboardClient initialDatasets={datasets || []} userId={user.id} />
}
