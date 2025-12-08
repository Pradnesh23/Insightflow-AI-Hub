import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, datasetId, context } = await request.json()

    const { columns, rowCount } = context || {}

    // Generate helpful response based on keywords
    let chatResponse = ""
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("column") || lowerMessage.includes("what")) {
      const columnList = columns?.map((col: string) => `• ${col}`).join("\n") || "No columns found"
      chatResponse = `📊 **Your Dataset Columns** (${columns?.length || 0} total):\n\n${columnList}\n\n💡 **Next Steps:**\n• **Statistical Analysis** - View detailed stats\n• **Correlation** - Explore relationships\n• **Visualizer** - Create charts`
    } else if (lowerMessage.includes("statistic") || lowerMessage.includes("mean") || lowerMessage.includes("median")) {
      chatResponse = `📈 **Statistical Analysis**\n\nFor detailed statistics including:\n• Mean & Median\n• Standard Deviation\n• Min & Max values\n• Count & Distribution\n\n👉 Visit the **Statistical Analysis** tab\nIt shows comprehensive stats for all ${columns?.length || 0} numeric columns.`
    } else if (lowerMessage.includes("quality") || lowerMessage.includes("missing")) {
      chatResponse = `✅ **Data Quality Check**\n\nTo assess your data quality:\n• Quality Score (0-100)\n• Missing Values Detection\n• Column Type Analysis\n• Data Completeness\n\n👉 Visit the **Quality Report** tab\nAnalyzes all ${rowCount || 0} rows across ${columns?.length || 0} columns.`
    } else if (lowerMessage.includes("correlation") || lowerMessage.includes("relationship") || lowerMessage.includes("related")) {
      chatResponse = `🔗 **Correlation Analysis**\n\nExplore relationships between variables:\n• Correlation Matrix\n• Heatmap Visualization\n• Strength Indicators\n• Variable Connections\n\n👉 Visit the **Correlation Analysis** tab\nShows how your columns relate to each other.`
    } else if (lowerMessage.includes("outlier") || lowerMessage.includes("anomal") || lowerMessage.includes("unusual")) {
      chatResponse = `⚠️ **Outlier Detection**\n\nFind anomalies in your data:\n• IQR Method Detection\n• Box Plot Visualization\n• Quartile Distribution (Q1, Q3)\n• Outlier Bounds & Count\n\n👉 Visit the **Outlier Detection** tab\nIdentifies unusual values in your dataset.`
    } else if (lowerMessage.includes("chart") || lowerMessage.includes("visual") || lowerMessage.includes("graph")) {
      chatResponse = `📊 **Data Visualization**\n\n**Option 1: AI-Recommended Charts**\nSee top 15 visualizations based on your data\n\n**Option 2: Custom Chart Requests**\nType natural language like:\n• "Show me a bar chart of sales by region"\n• "Create a line chart of temperature"\n• "Display a pie chart of categories"\n\n👉 Visit the **Visualizer** tab\nCreate stunning visualizations instantly!`
    } else if (lowerMessage.includes("analyze") || lowerMessage.includes("start")) {
      chatResponse = `🚀 **Getting Started**\n\nRecommended analysis workflow:\n\n1️⃣ **Quality Report** - Check data quality\n2️⃣ **Statistical Analysis** - View key statistics\n3️⃣ **Visualizer** - Create charts\n4️⃣ **Correlation** - Find relationships\n5️⃣ **Outliers** - Detect anomalies\n\nPick any tab to begin your analysis!`
    } else {
      chatResponse = `👋 **Welcome to AI Data Assistant!**\n\nYour dataset: **${rowCount || 0} rows** × **${columns?.length || 0} columns**\n\n**Try asking:**\n• "What columns do I have?"\n• "Show me statistics"\n• "Are there correlations?"\n• "Check data quality"\n• "Find outliers"\n• "Create a chart"\n\n**Or use the analysis tabs above for detailed insights!**`
    }

    // Save user message
    await supabase.from("chat_history").insert({
      user_id: user.id,
      dataset_id: datasetId,
      role: "user",
      content: message,
    })

    // Save assistant message
    await supabase.from("chat_history").insert({
      user_id: user.id,
      dataset_id: datasetId,
      role: "assistant",
      content: chatResponse,
    })

    return NextResponse.json({
      message: chatResponse,
      success: true,
    })
  } catch (error) {
    console.error("[Chat] Error:", error)

    // Provide helpful fallback response
    const fallbackMessage = `🤖 **AI Data Assistant**\n\nI can help you analyze your data!\n\n**Available Tabs:**\n📊 **Statistical Analysis** - Mean, median, std dev\n🔍 **Quality Report** - Data quality check\n📈 **Visualizer** - Create custom charts\n🔗 **Correlation** - Find relationships\n⚠️ **Outliers** - Detect anomalies`

    return NextResponse.json(
      {
        message: fallbackMessage,
        success: true,
      },
      { status: 200 }
    )
  }
}
