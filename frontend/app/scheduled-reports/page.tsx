import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { ScheduledReportsClient } from "@/components/scheduled-reports/scheduled-reports-client"

export default async function ScheduledReportsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: datasets } = await supabase.from("datasets").select("id, name").eq("user_id", user.id)

  const { data: scheduledReports } = await supabase
    .from("scheduled_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Scheduled Reports
          </h1>
          <p className="mt-2 text-slate-400">Automate report generation and delivery</p>
        </div>
        <ScheduledReportsClient datasets={datasets || []} initialReports={scheduledReports || []} />
      </div>
    </main>
  )
}
