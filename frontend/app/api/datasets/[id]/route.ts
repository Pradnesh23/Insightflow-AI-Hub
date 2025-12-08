import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch dataset data
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
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
            .eq("id", id)
            .eq("user_id", user.id)
            .single()

        if (datasetError || !dataset) {
            return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
        }

        // In a real implementation, you'd fetch the actual CSV/Excel data from storage
        // For now, generate sample data based on columns
        const sampleData = generateSampleData(dataset.columns, dataset.row_count || 100)

        return NextResponse.json({ data: sampleData })
    } catch (error) {
        console.error("Fetch dataset data error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch data" },
            { status: 500 }
        )
    }
}

function generateSampleData(columns: Array<{ name: string; type: string }>, rows: number) {
    const data = []
    for (let i = 0; i < rows; i++) {
        const row: Record<string, unknown> = {}
        columns.forEach((col) => {
            if (col.type === "number") {
                row[col.name] = Math.random() * 100
            } else {
                row[col.name] = `Value ${i}`
            }
        })
        data.push(row)
    }
    return data
}
