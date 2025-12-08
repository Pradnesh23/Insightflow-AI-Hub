import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MeetingAgentClient } from "@/components/meeting-agent/meeting-agent-client"

export default async function MeetingAgentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <MeetingAgentClient userId={user.id} />
}
