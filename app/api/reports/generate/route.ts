import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

    // Generate report using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `Generate a professional ${reportType} report for the following dataset:
    
Dataset Name: ${dataset.name}
Description: ${description || "No description provided"}
Rows: ${dataset.row_count}
Columns: ${dataset.column_count}

Available Analyses:
${analyses?.map((a) => `- ${a.analysis_type}: ${JSON.stringify(a.result_data).substring(0, 200)}...`).join("\n")}

Please create a comprehensive report with:
1. Executive Summary
2. Key Findings
3. Data Overview
4. Detailed Analysis
5. Recommendations
6. Conclusion

Format the response as JSON with these sections.`

    const result = await model.generateContent(prompt)
    const reportContent = result.response.text()

    // Parse and structure the report
    let parsedContent
    try {
      parsedContent = JSON.parse(reportContent)
    } catch {
      parsedContent = {
        executive_summary: reportContent,
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
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 })
  }
}
