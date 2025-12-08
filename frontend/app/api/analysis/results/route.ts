import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const datasetId = searchParams.get("datasetId")

        if (!datasetId) {
            return NextResponse.json({ error: "Dataset ID required" }, { status: 400 })
        }

        // Fetch all analysis results for this dataset
        const { data: results, error } = await supabase
            .from("analysis_results")
            .select("*")
            .eq("user_id", user.id)
            .eq("dataset_id", datasetId)
            .order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json({ results })
    } catch (error) {
        console.error("Fetch analysis results error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch results" },
            { status: 500 }
        )
    }
}
