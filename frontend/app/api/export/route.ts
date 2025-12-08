import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export async function POST(request: NextRequest) {
  try {
    const { analysisId, format, fileName } = await request.json()

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

    // Fetch analysis result
    const { data: analysis, error: analysisError } = await supabase
      .from("analysis_results")
      .select("*, datasets(name, columns)")
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    let fileBuffer: Buffer
    let mimeType: string
    let extension: string

    const resultData = analysis.result_data
    const datasetName = analysis.datasets.name

    if (format === "excel") {
      const workbook = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = [
        ["Analysis Report"],
        ["Dataset", datasetName],
        ["Type", analysis.analysis_type],
        ["Generated", new Date().toLocaleString()],
        [],
      ]

      // Add analysis-specific data
      if (analysis.analysis_type === "statistical") {
        summaryData.push(["Statistical Analysis"])
        Object.entries(resultData.statistics || {}).forEach(([key, value]: [string, any]) => {
          summaryData.push([key, value])
        })
      } else if (analysis.analysis_type === "correlation") {
        summaryData.push(["Correlation Analysis"])
        const correlations = resultData.correlations || []
        correlations.forEach((corr: any) => {
          summaryData.push([`${corr.var1} vs ${corr.var2}`, corr.correlation.toFixed(4)])
        })
      }

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

      // Raw data sheet if available
      if (resultData.data && Array.isArray(resultData.data)) {
        const dataSheet = XLSX.utils.json_to_sheet(resultData.data)
        XLSX.utils.book_append_sheet(workbook, dataSheet, "Data")
      }

      fileBuffer = Buffer.from(XLSX.write(workbook, { type: "array" }))
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      extension = "xlsx"
    } else if (format === "csv") {
      let csvContent = `Analysis Report\nDataset,${datasetName}\nType,${analysis.analysis_type}\nGenerated,${new Date().toLocaleString()}\n\n`

      if (resultData.data && Array.isArray(resultData.data)) {
        const headers = Object.keys(resultData.data[0] || {})
        csvContent += headers.join(",") + "\n"
        resultData.data.forEach((row: any) => {
          csvContent += headers.map((h) => row[h]).join(",") + "\n"
        })
      }

      fileBuffer = Buffer.from(csvContent)
      mimeType = "text/csv"
      extension = "csv"
    } else if (format === "pdf") {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text("Analysis Report", 20, 20)

      doc.setFontSize(12)
      doc.text(`Dataset: ${datasetName}`, 20, 35)
      doc.text(`Analysis Type: ${analysis.analysis_type}`, 20, 45)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 55)

      let yPosition = 70

      if (analysis.analysis_type === "statistical") {
        doc.setFontSize(14)
        doc.text("Statistical Analysis", 20, yPosition)
        yPosition += 15

        doc.setFontSize(11)
        Object.entries(resultData.statistics || {}).forEach(([key, value]: [string, any]) => {
          doc.text(`${key}: ${typeof value === "number" ? value.toFixed(4) : value}`, 20, yPosition)
          yPosition += 8
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
        })
      }

      fileBuffer = Buffer.from(doc.output("arraybuffer"))
      mimeType = "application/pdf"
      extension = "pdf"
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName || "analysis"}.${extension}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
