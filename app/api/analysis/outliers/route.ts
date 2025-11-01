import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface DataPoint {
  [key: string]: number | string | null
}

function detectOutliers(values: number[], threshold = 1.5) {
  const sorted = [...values].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  const lowerBound = q1 - threshold * iqr
  const upperBound = q3 + threshold * iqr

  return {
    outliers: values.map((v, i) => ({ index: i, value: v, isOutlier: v < lowerBound || v > upperBound })),
    bounds: { lower: lowerBound, upper: upperBound },
    count: values.filter((v) => v < lowerBound || v > upperBound).length,
  }
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

    const outlierAnalysis: Record<string, ReturnType<typeof detectOutliers>> = {}

    for (const col of columns) {
      const values = (data as DataPoint[]).map((row) => Number(row[col])).filter((v) => !isNaN(v))

      if (values.length > 0) {
        outlierAnalysis[col] = detectOutliers(values)
      }
    }

    const { data: result, error } = await supabase
      .from("analysis_results")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        analysis_type: "outlier",
        result_data: outlierAnalysis,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(result)
  } catch (error) {
    console.error("Outlier detection error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
