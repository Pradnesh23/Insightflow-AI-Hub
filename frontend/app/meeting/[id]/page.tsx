import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MeetingViewClient } from "@/components/meeting-agent/meeting-view-client"

export default async function MeetingViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: meeting } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!meeting) {
    redirect("/memories")
  }

  return <MeetingViewClient meeting={meeting} />
}
