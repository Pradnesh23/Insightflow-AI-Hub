import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { datasetId, widgetType, title, config } = await request.json()

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

    const { data: widget, error } = await supabase
      .from("dashboard_widgets")
      .insert({
        dashboard_id: params.id,
        dataset_id: datasetId,
        widget_type: widgetType,
        title,
        config,
        position_x: 0,
        position_y: 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to add widget" }, { status: 500 })
    }

    return NextResponse.json(widget)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to add widget" }, { status: 500 })
  }
}
