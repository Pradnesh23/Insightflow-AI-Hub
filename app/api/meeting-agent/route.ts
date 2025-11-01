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

    const formData = await request.formData()
    const companyName = formData.get("companyName") as string
    const topic = formData.get("topic") as string
    const context = formData.get("context") as string
    const participants = formData.get("participants") as string
    const files = formData.getAll("files") as File[]

    let fileContext = ""
    if (files.length > 0) {
      for (const file of files) {
        const buffer = await file.arrayBuffer()
        const text = Buffer.from(buffer).toString("utf-8")
        fileContext += `\n\nFile: ${file.name}\n${text.substring(0, 2000)}`
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const agendaResult =
      await model.generateContent(`You are a professional meeting planner for ${companyName}. Create a detailed, actionable meeting agenda for:

Topic: ${topic}
Company: ${companyName}
Participants: ${participants || "Team members"}
Context: ${context}
${fileContext ? `\nCompany Information:\n${fileContext}` : ""}

CRITICAL FORMAT REQUIREMENTS - Follow EXACTLY:

Each agenda item MUST follow this EXACT format:

10:00-10:15 (15 min) **Opening & Objectives Review**
   • Review meeting goals and expected outcomes
   • Quick round of introductions and role clarification
   • Set ground rules and time expectations

10:15-10:45 (30 min) **Main Discussion Topic**
   • Specific discussion point 1
   • Specific discussion point 2
   • Specific discussion point 3
   • Q&A and concerns

RULES:
1. Time MUST come FIRST: HH:MM-HH:MM (XX min) **Title**
2. Title MUST be wrapped in **double asterisks**
3. Discussion points MUST use bullet symbol: •
4. Add exactly 3-5 bullet points under EACH agenda item
5. Include 5-7 agenda items total
6. Total meeting time: 90-120 minutes
7. Make discussion points specific to ${topic} and ${companyName}
8. Keep each bullet point actionable and clear (1-2 sentences max)

DO NOT add any extra formatting, tables, or text outside this structure.`)

    const agenda = agendaResult.response.text()

    const researchResult =
      await model.generateContent(`Provide actionable research and insights for ${companyName}'s meeting about: ${topic}
      
${fileContext ? `\nCompany Background:\n${fileContext}` : ""}
${context ? `\nAdditional Context: ${context}` : ""}

Structure your response EXACTLY as follows:

**Industry Trends**
• [Trend 1 - keep it specific and relevant]
• [Trend 2]
• [Trend 3]
• [Trend 4]

**Best Practices**
• [Practice 1 - actionable recommendation]
• [Practice 2]
• [Practice 3]
• [Practice 4]

**Challenges**
• [Challenge 1 - specific to the company/topic]
• [Challenge 2]
• [Challenge 3]

**Recommendations**
• [Recommendation 1 - clear action item]
• [Recommendation 2]
• [Recommendation 3]
• [Recommendation 4]

Use bullet points (•) only. Keep each point concise (1-2 sentences). Focus on actionable insights.`)

    const research = researchResult.response.text()

    // Save meeting to database
    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        user_id: user.id,
        topic,
        agenda,
        research,
        participants: participants?.split(",").map((p) => p.trim()) || [],
        company_name: companyName,
      })
      .select()
      .single()

    if (error) throw error

    // Save comprehensive meeting memory (combined agenda + insights)
    await supabase.from("memories").insert({
      user_id: user.id,
      memory_type: "meeting",
      content: `${topic} - ${companyName}`,
      metadata: {
        company_name: companyName,
        topic,
        participants: participants?.split(",").map((p) => p.trim()) || [],
        meeting_id: meeting.id,
        agenda_preview: agenda.substring(0, 200),
        research_preview: research.substring(0, 200),
        created_from: "meeting_agent",
        full_data: {
          agenda,
          research,
        },
      },
    })

    return NextResponse.json({
      meeting,
      agenda,
      research,
    })
  } catch (error) {
    console.error("[v0] Meeting agent error:", error)
    return NextResponse.json({ error: "Meeting planning failed" }, { status: 500 })
  }
}
