import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

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

    // Analyze data quality
    const qualityReport = await analyzeDataQuality(dataset)

    // Save quality report
    const { data: report, error: reportError } = await supabase
      .from("data_quality_reports")
      .insert({
        user_id: user.id,
        dataset_id: datasetId,
        quality_score: qualityReport.quality_score,
        missing_values: qualityReport.missing_values,
        duplicate_rows: qualityReport.duplicate_rows,
        outliers: qualityReport.outliers,
        data_type_issues: qualityReport.data_type_issues,
        recommendations: qualityReport.recommendations,
      })
      .select()
      .single()

    if (reportError) {
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Data quality analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

async function analyzeDataQuality(dataset: any) {
  const columns = dataset.columns || []
  const rowCount = dataset.row_count || 0

  const missingValues: Record<string, number> = {}
  let duplicateRows = 0
  const outliers: Record<string, number> = {}
  const dataTypeIssues: Record<string, string[]> = {}
  const recommendations: string[] = []

  // Simulate data quality analysis
  // In production, you would fetch actual data and analyze it
  columns.forEach((col: any) => {
    const missingPercent = Math.random() * 20
    if (missingPercent > 0) {
      missingValues[col.name] = Math.floor((missingPercent / 100) * rowCount)
    }
  })

  duplicateRows = Math.floor(rowCount * (Math.random() * 0.1))

  columns.forEach((col: any) => {
    if (col.type === "numeric") {
      outliers[col.name] = Math.floor(Math.random() * 10)
    }
  })

  // Generate recommendations
  if (Object.keys(missingValues).length > 0) {
    recommendations.push("Consider handling missing values through imputation or removal")
  }
  if (duplicateRows > 0) {
    recommendations.push(`Found ${duplicateRows} duplicate rows - consider deduplication`)
  }
  if (Object.keys(outliers).length > 0) {
    recommendations.push("Detected outliers in numeric columns - review for data quality")
  }

  const qualityScore = Math.max(
    0,
    100 -
      Object.values(missingValues).reduce((a, b) => a + b, 0) * 0.1 -
      duplicateRows * 0.5 -
      Object.values(outliers).reduce((a, b) => a + b, 0) * 0.2,
  )

  return {
    quality_score: Math.min(100, qualityScore),
    missing_values: missingValues,
    duplicate_rows: duplicateRows,
    outliers,
    data_type_issues: dataTypeIssues,
    recommendations,
  }
}
