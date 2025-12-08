import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import Papa from "papaparse"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith(".csv") && !fileName.endsWith(".xlsx")) {
      return NextResponse.json({ error: "Only CSV and Excel files are supported" }, { status: 400 })
    }

    const text = await file.text()

    const parsed = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    })

    if (parsed.errors.length > 0) {
      console.error("[v0] CSV parsing errors:", parsed.errors)
      return NextResponse.json(
        {
          error: "Invalid CSV file format",
          details: parsed.errors[0]?.message,
        },
        { status: 400 },
      )
    }

    const data = (parsed.data as Record<string, unknown>[]).filter((row) =>
      Object.values(row).some((val) => val !== null && val !== undefined && val !== ""),
    )

    if (data.length === 0) {
      return NextResponse.json({ error: "No valid data found in file" }, { status: 400 })
    }

    const columns = Object.keys(data[0] || {}).map((col) => ({
      name: col,
      type: typeof data[0]?.[col],
    }))

    if (columns.length === 0) {
      return NextResponse.json({ error: "No columns found in file" }, { status: 400 })
    }

    const { data: dataset, error } = await supabase
      .from("datasets")
      .insert({
        user_id: user.id,
        name: file.name,
        file_path: `datasets/${user.id}/${Date.now()}-${file.name}`,
        file_size: file.size,
        row_count: data.length,
        column_count: columns.length,
        columns: columns,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database insert error:", error)
      return NextResponse.json(
        {
          error: "Failed to save dataset",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Dataset uploaded successfully:", dataset.id)

    return NextResponse.json({
      success: true,
      dataset,
      data: data.slice(0, 100),
      totalRows: data.length,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
