import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { DashboardsClient } from "@/components/dashboards/dashboards-client"

export default async function DashboardsPage() {
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

  const { data: dashboards } = await supabase
    .from("dashboards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: datasets } = await supabase.from("datasets").select("id, name").eq("user_id", user.id)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Real-time Dashboards
          </h1>
          <p className="mt-2 text-slate-400">Monitor your data with live updating dashboards</p>
        </div>
        <DashboardsClient dashboards={dashboards || []} datasets={datasets || []} />
      </div>
    </main>
  )
}
