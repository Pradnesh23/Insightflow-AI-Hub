import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { datasetId, reportType, title, description } = await request.json()

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

    // Fetch dataset and analysis results
    const { data: dataset } = await supabase
      .from("datasets")
      .select("*")
      .eq("id", datasetId)
      .eq("user_id", user.id)
      .single()

    const { data: analyses } = await supabase
      .from("analysis_results")
      .select("*")
      .eq("dataset_id", datasetId)
      .eq("user_id", user.id)

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
    }

    // Call Python CrewAI backend for report generation
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/reports/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        dataset_id: datasetId,
        report_type: reportType,
        analysis_data: {
          dataset_name: dataset.name,
          description: description || "No description provided",
          row_count: dataset.row_count,
          column_count: dataset.column_count,
          analyses: analyses || [],
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Report generation failed")
    }

    const result = await response.json()

    // Parse report content
    let parsedContent
    try {
      parsedContent = typeof result.report === "string" ? JSON.parse(result.report) : result.report
    } catch {
      parsedContent = {
        executive_summary: result.report,
        key_findings: [],
        data_overview: {},
        detailed_analysis: "",
        recommendations: [],
        conclusion: "",
      }
    }

    // Save report to database
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        title: title || `${reportType} Report - ${dataset.name}`,
        description,
        report_type: reportType,
        content: parsedContent,
        format: "pdf",
      })
      .select()
      .single()

    if (reportError) {
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Report generation failed" },
      { status: 500 }
    )
  }
}
