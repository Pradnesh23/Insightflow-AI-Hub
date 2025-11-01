import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface DataPoint {
  [key: string]: number | string | null
}

function calculateCorrelation(x: number[], y: number[]) {
  const n = x.length
  const meanX = x.reduce((a, b) => a + b, 0) / n
  const meanY = y.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let sumX2 = 0
  let sumY2 = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    numerator += dx * dy
    sumX2 += dx * dx
    sumY2 += dy * dy
  }

  return numerator / Math.sqrt(sumX2 * sumY2)
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

    const correlations: Record<string, Record<string, number>> = {}

    for (let i = 0; i < numericColumns.length; i++) {
      correlations[numericColumns[i]] = {}
      for (let j = 0; j < numericColumns.length; j++) {
        if (i === j) {
          correlations[numericColumns[i]][numericColumns[j]] = 1
        } else {
          const x = (data as DataPoint[]).map((row) => Number(row[numericColumns[i]])).filter((v) => !isNaN(v))
          const y = (data as DataPoint[]).map((row) => Number(row[numericColumns[j]])).filter((v) => !isNaN(v))

          if (x.length === y.length && x.length > 1) {
            correlations[numericColumns[i]][numericColumns[j]] = calculateCorrelation(x, y)
          }
        }
      }
    }

    const { data: result, error } = await supabase
      .from("analysis_results")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        analysis_type: "correlation",
        result_data: correlations,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(result)
  } catch (error) {
    console.error("Correlation analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
