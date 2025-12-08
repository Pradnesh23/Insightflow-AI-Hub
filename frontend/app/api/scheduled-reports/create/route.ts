import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { datasetId, title, frequency, dayOfWeek, dayOfMonth, timeOfDay, emailRecipients, reportType } =
      await request.json()

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

    // Calculate next run time
    const nextRunAt = calculateNextRunTime(frequency, dayOfWeek, dayOfMonth, timeOfDay)

    const { data: scheduledReport, error } = await supabase
      .from("scheduled_reports")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        title,
        frequency,
        day_of_week: dayOfWeek,
        day_of_month: dayOfMonth,
        time_of_day: timeOfDay,
        email_recipients: emailRecipients,
        report_type: reportType,
        next_run_at: nextRunAt,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create scheduled report" }, { status: 500 })
    }

    return NextResponse.json(scheduledReport)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create scheduled report" }, { status: 500 })
  }
}

function calculateNextRunTime(frequency: string, dayOfWeek?: number, dayOfMonth?: number, timeOfDay?: string): Date {
  const now = new Date()
  const [hours, minutes] = (timeOfDay || "09:00").split(":").map(Number)

  const nextRun = new Date(now)
  nextRun.setHours(hours, minutes, 0, 0)

  if (frequency === "daily") {
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
  } else if (frequency === "weekly") {
    const targetDay = dayOfWeek || 1
    const currentDay = nextRun.getDay()
    let daysToAdd = targetDay - currentDay
    if (daysToAdd <= 0) daysToAdd += 7
    nextRun.setDate(nextRun.getDate() + daysToAdd)
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 7)
    }
  } else if (frequency === "monthly") {
    const targetDate = dayOfMonth || 1
    nextRun.setDate(targetDate)
    if (nextRun <= now) {
      nextRun.setMonth(nextRun.getMonth() + 1)
    }
  }

  return nextRun
}
