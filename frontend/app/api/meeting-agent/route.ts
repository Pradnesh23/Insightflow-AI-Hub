import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const companyName = formData.get("companyName") as string
    const topic = formData.get("topic") as string
    const context = formData.get("context") as string
    const participants = formData.get("participants") as string

    // Call Python CrewAI backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/meetings/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        company_name: companyName,
        topic: topic,
        context: context || "",
        participants: participants || "",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Meeting generation failed")
    }

    const result = await response.json()

    // Save meeting to meetings table
    const { data: savedMeeting, error: meetingError } = await supabase
      .from("meetings")
      .insert({
        user_id: user.id,
        company_name: companyName,
        topic,
        agenda: result.agenda || "",
        research: result.research || "",
        participants: participants?.split(",").map((p) => p.trim()) || [],
      })
      .select()
      .single()

    if (meetingError) {
      console.error("[Meeting Agent] Error saving meeting:", meetingError)
      throw new Error("Failed to save meeting")
    }

    // Save memory to Supabase
    await supabase.from("memories").insert({
      user_id: user.id,
      memory_type: "meeting",
      content: `${topic} - ${companyName}`,
      metadata: {
        company_name: companyName,
        topic,
        participants: participants?.split(",").map((p) => p.trim()) || [],
        meeting_id: savedMeeting.id,
        agenda_preview: result.agenda?.substring(0, 200) || "",
        research_preview: result.research?.substring(0, 200) || "",
        created_from: "meeting_agent",
      },
    })

    return NextResponse.json({
      meeting: { id: savedMeeting.id },
      agenda: result.agenda,
      research: result.research,
    })
  } catch (error) {
    console.error("[Meeting Agent] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meeting planning failed" },
      { status: 500 }
    )
  }
}
