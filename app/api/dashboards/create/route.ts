import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: dashboard, error } = await supabase
      .from("dashboards")
      .insert({
        user_id: user.id,
        title,
        description,
        layout: { widgets: [] },
        refresh_interval: 300,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create dashboard" }, { status: 500 })
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create dashboard" }, { status: 500 })
  }
}
