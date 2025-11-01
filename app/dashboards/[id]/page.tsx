import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { DashboardDetailClient } from "@/components/dashboards/dashboard-detail-client"

export default async function DashboardDetailPage({ params }: { params: { id: string } }) {
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

  const { data: dashboard } = await supabase
    .from("dashboards")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!dashboard) {
    redirect("/dashboards")
  }

  const { data: widgets } = await supabase
    .from("dashboard_widgets")
    .select("*, datasets(name)")
    .eq("dashboard_id", params.id)

  const { data: datasets } = await supabase.from("datasets").select("id, name").eq("user_id", user.id)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {dashboard.title}
          </h1>
          <p className="mt-2 text-slate-400">{dashboard.description}</p>
        </div>
        <DashboardDetailClient dashboard={dashboard} widgets={widgets || []} datasets={datasets || []} />
      </div>
    </main>
  )
}
