import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AnalysisClient } from "@/components/analysis/analysis-client"

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: dataset } = await supabase.from("datasets").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!dataset) {
    redirect("/dashboard")
  }

  return <AnalysisClient dataset={dataset} userId={user.id} />
}
