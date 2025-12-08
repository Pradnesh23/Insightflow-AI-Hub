import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { memoryType, content, metadata } = await request.json()

    const { data: memory, error } = await supabase
      .from("memories")
      .insert({
        user_id: user.id,
        memory_type: memoryType,
        content,
        metadata,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(memory)
  } catch (error) {
    console.error("Memory save error:", error)
    return NextResponse.json({ error: "Failed to save memory" }, { status: 500 })
  }
}
