import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
    try {
        const { message, data, columns } = await request.json()

        // Get numeric and categorical columns
        const numericCols = columns.filter((col: any) =>
            typeof data[0]?.[col.name] === 'number'
        ).map((c: any) => c.name)

        const categoricalCols = columns.filter((col: any) =>
            typeof data[0]?.[col.name] === 'string'
        ).map((c: any) => c.name)

        // AI prompt to interpret chart request
        const prompt = `You are a data visualization expert. Parse this chart request and return ONLY a JSON object (no markdown, no code blocks).

User Request: "${message}"

Available Columns:
- Numeric: ${numericCols.join(', ')}
- Categorical: ${categoricalCols.join(', ')}

Return JSON with this exact structure:
{
  "chartType": "bar|line|scatter|pie|area",
  "xAxis": "column_name",
  "yAxis": "column_name",
  "title": "Chart Title",
  "message": "Brief response to user"
}

Rules:
- chartType must be one of: bar, line, scatter, pie, area
- xAxis should be categorical for bar/pie, numeric for scatter/line
- yAxis should be numeric
- If request is unclear, suggest bar chart
- Keep message under 50 words`

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
        const result = await model.generateContent(prompt)
        const response = await result.response
        let content = response.text().trim()

        // Remove markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        const chartConfig = JSON.parse(content)

        // Validate columns exist
        if (!columns.find((c: any) => c.name === chartConfig.xAxis)) {
            chartConfig.xAxis = categoricalCols[0] || numericCols[0]
        }
        if (!columns.find((c: any) => c.name === chartConfig.yAxis)) {
            chartConfig.yAxis = numericCols[0]
        }

        return NextResponse.json({
            success: true,
            chartConfig,
        })
    } catch (error: any) {
        console.error("Visualization generation error:", error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                chartConfig: {
                    chartType: "bar",
                    xAxis: "column1",
                    yAxis: "column2",
                    title: "Default Chart",
                    message: "I couldn't parse your request. Here's a default chart."
                }
            },
            { status: 200 }
        )
    }
}
