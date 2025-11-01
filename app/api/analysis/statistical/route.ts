import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface DataPoint {
  [key: string]: number | string | null
}

function calculateStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const median = sorted[Math.floor(sorted.length / 2)]
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min

  return { mean, median, stdDev, min, max, range, variance }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { datasetId, data, columns } = await request.json()

    const numericColumns = columns.filter((col: string) => {
      const values = (data as DataPoint[]).map((row) => row[col]).filter((v) => v !== null && v !== "")
      return values.length > 0 && !isNaN(Number(values[0]))
    })

    const stats: Record<string, ReturnType<typeof calculateStats>> = {}
    for (const col of numericColumns) {
      const values = (data as DataPoint[]).map((row) => Number(row[col])).filter((v) => !isNaN(v))
      stats[col] = calculateStats(values)
    }

    const { data: result, error } = await supabase
      .from("analysis_results")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        analysis_type: "statistical",
        result_data: stats,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(result)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
