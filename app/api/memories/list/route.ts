import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memoryType = searchParams.get("type")

    let query = supabase.from("memories").select("*").eq("user_id", user.id)

    if (memoryType) {
      query = query.eq("memory_type", memoryType)
    }

    const { data: memories, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(memories)
  } catch (error) {
    console.error("Memory list error:", error)
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 })
  }
}
