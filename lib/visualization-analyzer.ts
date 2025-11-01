export interface Column {
  name: string
  type: string
}

export interface VisualizationRecommendation {
  type: string
  title: string
  description: string
  columns: string[]
  priority: number
}

export function analyzeDataset(data: Record<string, unknown>[], columns: Column[]): VisualizationRecommendation[] {
  const recommendations: VisualizationRecommendation[] = []

  const numericColumns = columns.filter((c) => c.type === "number").map((c) => c.name)
  const stringColumns = columns.filter((c) => c.type === "string").map((c) => c.name)
  const dateColumns = stringColumns.filter((col) =>
    data.some((row) => {
      const val = String(row[col])
      return (
        /^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{4}|time|date|timestamp/i.test(val) || /^\d{4}-\d{2}-\d{2}T/.test(val)
      )
    }),
  )

  // Time series analysis
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    recommendations.push({
      type: "line",
      title: "Time Series Trend",
      description: "Track numeric values over time",
      columns: [dateColumns[0], numericColumns[0]],
      priority: 10,
    })

    recommendations.push({
      type: "area",
      title: "Cumulative Trend",
      description: "Visualize cumulative changes over time",
      columns: [dateColumns[0], numericColumns[0]],
      priority: 9,
    })
  }

  // Distribution analysis
  if (numericColumns.length > 0) {
    recommendations.push({
      type: "distribution",
      title: "Value Distribution",
      description: "Analyze distribution of numeric values",
      columns: [numericColumns[0]],
      priority: 8,
    })

    if (numericColumns.length > 1) {
      recommendations.push({
        type: "scatter",
        title: "Correlation Analysis",
        description: "Find relationships between numeric columns",
        columns: [numericColumns[0], numericColumns[1]],
        priority: 7,
      })
    }
  }

  // Categorical comparison
  if (stringColumns.length > 0 && numericColumns.length > 0) {
    recommendations.push({
      type: "bar",
      title: "Category Comparison",
      description: "Compare values across categories",
      columns: [stringColumns[0], numericColumns[0]],
      priority: 6,
    })
  }

  // Multi-metric comparison
  if (numericColumns.length > 1) {
    recommendations.push({
      type: "comparison",
      title: "Multi-Metric Comparison",
      description: "Compare multiple numeric metrics",
      columns: numericColumns.slice(0, 3),
      priority: 5,
    })

    recommendations.push({
      type: "radar",
      title: "Multi-Dimensional View",
      description: "Radar chart for comprehensive analysis",
      columns: numericColumns.slice(0, 3),
      priority: 4,
    })
  }

  // Composition analysis
  if (stringColumns.length > 0) {
    const uniqueValues = new Set(data.map((row) => row[stringColumns[0]]))
    if (uniqueValues.size <= 10 && numericColumns.length > 0) {
      recommendations.push({
        type: "pie",
        title: "Composition Breakdown",
        description: "Show proportional distribution",
        columns: [stringColumns[0], numericColumns[0]],
        priority: 3,
      })
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority)
}

export function getSmartChartData(data: Record<string, unknown>[], columns: string[]): Record<string, unknown>[] {
  // Use more data points for better visualization
  const sampleSize = Math.min(data.length, 100)
  const step = Math.max(1, Math.floor(data.length / sampleSize))

  return data
    .filter((_, idx) => idx % step === 0)
    .map((row, idx) => ({
      name: `Item ${idx + 1}`,
      ...Object.fromEntries(columns.map((col) => [col, row[col]])),
    }))
}
