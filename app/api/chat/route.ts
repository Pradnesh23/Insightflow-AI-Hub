import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, datasetId, context } = await request.json()

    // Save user message
    await supabase.from("chat_history").insert({
      user_id: user.id,
      dataset_id: datasetId,
      role: "user",
      content: message,
    })

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const result = await model.generateContent(`You are a data analysis expert. Help the user analyze their data.
      
Context: ${JSON.stringify(context)}

User question: ${message}

Provide a concise, insightful response about the data.`)

    const text = result.response.text()

    // Save assistant message
    const { data: chatMessage, error } = await supabase
      .from("chat_history")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        role: "assistant",
        content: text,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: text,
      chatMessage,
    })
  } catch (error) {
    console.error("[v0] Chat error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}
