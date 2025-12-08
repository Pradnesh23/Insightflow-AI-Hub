import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { datasetId } = await request.json()

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

    // Fetch dataset
    const { data: dataset, error: datasetError } = await supabase
      .from("datasets")
      .select("*")
      .eq("id", datasetId)
      .eq("user_id", user.id)
      .single()

    if (datasetError || !dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
    }

    // Call Python CrewAI backend for quality analysis
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/analysis/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        dataset_id: datasetId,
        data: dataset.data || [],
        columns: dataset.columns?.map((c: any) => c.name) || [],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Quality analysis failed")
    }

    const result = await response.json()

    // Parse quality report to extract metrics (simplified)
    const qualityScore = 85 // Default, would parse from result.quality_report
    const recommendations = [result.quality_report]

    // Save quality report
    const { data: report, error: reportError } = await supabase
      .from("data_quality_reports")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        quality_score: qualityScore,
        missing_values: {},
        duplicate_rows: 0,
        outliers: {},
        data_type_issues: {},
        recommendations: recommendations,
      })
      .select()
      .single()

    if (reportError) {
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Data quality analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    )
  }
}
