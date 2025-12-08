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

    const { datasetId, data, columns } = await request.json()

    // Call Python CrewAI backend for statistical analysis
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/analysis/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        dataset_id: datasetId,
        data: data,
        columns: columns,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Statistical analysis failed")
    }

    const result = await response.json()

    // Save to database with complete result
    const { data: savedResult, error: saveError } = await supabase
      .from("analysis_results")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        analysis_type: "statistical",
        result_data: {
          analysis_report: result.analysis_report,
          quality_report: result.quality_report,
          statistics: result.statistics,
          correlations: result.correlations,
          outliers: result.outliers,
          quality_score: result.quality_score
        },
      })
      .select()
      .single()

    if (saveError) throw saveError

    return NextResponse.json(savedResult)
  } catch (error) {
    console.error("Statistical analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    )
  }
}
