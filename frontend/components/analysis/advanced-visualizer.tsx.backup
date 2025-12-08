"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { analyzeDataset, getSmartChartData, type VisualizationRecommendation } from "@/lib/visualization-analyzer"
import { Lightbulb, TrendingUp, BarChart3 } from "lucide-react"

interface Column {
  name: string
  type: string
}

interface AdvancedVisualizerProps {
  data: Record<string, unknown>[]
  columns: Column[]
}

const COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#6366f1"]

export function AdvancedVisualizer({ data, columns }: AdvancedVisualizerProps) {
  const allRecommendations = useMemo(() => {
    const baseRecs = analyzeDataset(data, columns)
    const numericColumns = columns.filter((c) => c.type === "number").map((c) => c.name)
    const categoryColumns = columns.filter((c) => c.type === "string").map((c) => c.name)
    
    // Generate 15 different visualization variations
    const extraVisualizations: VisualizationRecommendation[] = []
    
    // Add more chart type variations
    if (numericColumns.length >= 2) {
      extraVisualizations.push(
        {
          type: "line",
          title: "Trend Analysis",
          description: `Track changes across ${numericColumns.slice(0, 2).join(" and ")}`
,
          columns: numericColumns.slice(0, 2),
          priority: 75,
        },
        {
          type: "area",
          title: "Cumulative View",
          description: "Visualize cumulative patterns over time",
          columns: numericColumns.slice(0, 2),
          priority: 70,
        },
        {
          type: "scatter",
          title: "Correlation Plot",
          description: `Explore relationship between ${numericColumns[0]} and ${numericColumns[1] || numericColumns[0]}`
,
          columns: numericColumns.slice(0, 2),
          priority: 80,
        },
        {
          type: "radar",
          title: "Multi-dimensional Comparison",
          description: "Compare multiple metrics simultaneously",
          columns: numericColumns.slice(0, 5),
          priority: 65,
        }
      )
    }
    
    if (categoryColumns.length > 0 && numericColumns.length > 0) {
      extraVisualizations.push(
        {
          type: "pie",
          title: "Distribution Overview",
          description: `Breakdown by ${categoryColumns[0]}`
,
          columns: [numericColumns[0]],
          priority: 72,
        },
        {
          type: "distribution",
          title: "Horizontal Distribution",
          description: "Compare values side by side",
          columns: [numericColumns[0]],
          priority: 68,
        }
      )
    }
    
    // Add comparison variations
    for (let i = 0; i < Math.min(3, numericColumns.length - 1); i++) {
      extraVisualizations.push({
        type: "comparison",
        title: `Comparison: ${numericColumns.slice(i, i + 2).join(" vs ")}`
,
        description: "Side-by-side metric comparison",
        columns: numericColumns.slice(i, i + 2),
        priority: 60 - i * 5,
      })
    }
    
    // Add stacked variations
    if (numericColumns.length >= 3) {
      extraVisualizations.push(
        {
          type: "stacked-bar",
          title: "Stacked Bar Chart",
          description: "View cumulative totals",
          columns: numericColumns.slice(0, 3),
          priority: 67,
        },
        {
          type: "stacked-area",
          title: "Stacked Area Chart",
          description: "Cumulative trend visualization",
          columns: numericColumns.slice(0, 3),
          priority: 63,
        }
      )
    }
    
    // Combine and sort by priority
    const allViz = [...baseRecs, ...extraVisualizations]
      .slice(0, 15)
      .sort((a, b) => b.priority - a.priority)
    
    return allViz
  }, [data, columns])

  // Top 3 best visualizations
  const topVisualizations = allRecommendations.slice(0, 3)
  // Remaining visualizations for dropdown
  const otherVisualizations = allRecommendations.slice(3)

  const [selectedVisualization, setSelectedVisualization] = useState<VisualizationRecommendation | null>(
    topVisualizations[0] || null
  )
  const [selectedDropdownViz, setSelectedDropdownViz] = useState<string>("")

  const numericColumns = columns.filter((c) => c.type === "number").map((c) => c.name)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    selectedVisualization?.columns || numericColumns.slice(0, 2),
  )

  const chartData = useMemo(() => {
    return getSmartChartData(data, selectedColumns)
  }, [data, selectedColumns])

  const renderChart = (type: string) => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
              <Legend />
              {selectedColumns.map((col, idx) => (
                <Bar key={col} dataKey={col} fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
              <Legend />
              {selectedColumns.map((col, idx) => (
                <Line key={col} type="monotone" dataKey={col} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
              <Legend />
              {selectedColumns.map((col, idx) => (
                <Area
                  key={col}
                  type="monotone"
                  dataKey={col}
                  fill={COLORS[idx % COLORS.length]}
                  stroke={COLORS[idx % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={selectedColumns[0]}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {chartData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey={selectedColumns[0]} stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis dataKey={selectedColumns[1]} stroke="rgba(148, 163, 184, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
              <Scatter name="Data" data={chartData} fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        )
      case "radar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
              <PolarAngleAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
              <PolarRadiusAxis stroke="rgba(148, 163, 184, 0.5)" />
              {selectedColumns.map((col, idx) => (
                <Radar
                  key={col}
                  name={col}
                  dataKey={col}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.6 - idx * 0.2}
                />
              ))}
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )
      case "distribution":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis type="number" stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis dataKey="name" type="category" stroke="rgba(148, 163, 184, 0.5)" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
              <Bar dataKey={selectedColumns[0]} fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case "comparison":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
              <Legend />
              {selectedColumns.map((col, idx) => (
                <Bar key={col} dataKey={col} fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      case "stacked-bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
              <Legend />
              {selectedColumns.map((col, idx) => (
                <Bar key={col} dataKey={col} stackId="a" fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      case "stacked-area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
              <Legend />
              {selectedColumns.map((col, idx) => (
                <Area
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stackId="1"
                  fill={COLORS[idx % COLORS.length]}
                  stroke={COLORS[idx % COLORS.length]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
              <Legend />
              {selectedColumns.map((col, idx) => (
                <Bar key={col} dataKey={col} fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Advanced Data Visualizer</h2>
        <p className="text-muted mb-4">AI-powered visualizations based on your dataset</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="w-3 h-3" />
            {allRecommendations.length} Visualizations Generated
          </Badge>
          <Badge variant="secondary">
            Top 3 Displayed
          </Badge>
        </div>
      </div>

      {/* Top 3 Best Visualizations */}
      {topVisualizations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Best Visualizations for Your Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topVisualizations.map((rec, idx) => (
              <Card
                key={idx}
                className={`glass-effect border-surface-light/20 cursor-pointer transition-all ${
                  selectedVisualization?.type === rec.type && selectedVisualization?.title === rec.title
                    ? "ring-2 ring-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => {
                  setSelectedVisualization(rec)
                  setSelectedColumns(rec.columns)
                  setSelectedDropdownViz("")
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground">{rec.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          #{idx + 1}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Visualizations Dropdown */}
      {otherVisualizations.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted">Or explore other visualizations:</label>
          <Select
            value={selectedDropdownViz}
            onValueChange={(value) => {
              const viz = otherVisualizations.find((v, idx) => `${idx}` === value)
              if (viz) {
                setSelectedVisualization(viz)
                setSelectedColumns(viz.columns)
                setSelectedDropdownViz(value)
              }
            }}
          >
            <SelectTrigger className="w-[300px] bg-surface/50 border-surface-light/20">
              <SelectValue placeholder="Select another visualization..." />
            </SelectTrigger>
            <SelectContent>
              {otherVisualizations.map((viz, idx) => (
                <SelectItem key={idx} value={`${idx}`}>
                  {viz.title} ({viz.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Chart Display */}
      <Card className="glass-effect border-surface-light/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{selectedVisualization?.title || "Data Visualization"}</CardTitle>
            <Badge variant="outline">
              {selectedVisualization?.type || "bar"} chart
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedVisualization?.description || "Interactive data visualization"}
          </p>
        </CardHeader>
        <CardContent>{renderChart(selectedVisualization?.type || "bar")}</CardContent>
      </Card>
    </div>
  )
}
