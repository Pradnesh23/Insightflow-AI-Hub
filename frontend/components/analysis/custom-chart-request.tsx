"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, Sparkles } from "lucide-react"
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
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

interface Column {
    name: string
    type: string
}

interface CustomChartRequestProps {
    data: Record<string, unknown>[]
    columns: Column[]
}

interface CustomChart {
    id: string
    type: string
    xAxis: string
    yAxis: string
    title: string
    message: string
}

const COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]

export function CustomChartRequest({ data, columns }: CustomChartRequestProps) {
    const [customCharts, setCustomCharts] = useState<CustomChart[]>([])
    const [chatInput, setChatInput] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [customCharts])

    const handleGenerateChart = async () => {
        if (!chatInput.trim()) return

        const userMessage = chatInput
        setChatInput("")
        setIsGenerating(true)

        try {
            const response = await fetch("/api/visualizations/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    data,
                    columns,
                }),
            })

            const result = await response.json()
            const { chartConfig } = result

            const newChart: CustomChart = {
                id: Date.now().toString(),
                type: chartConfig.chartType,
                xAxis: chartConfig.xAxis,
                yAxis: chartConfig.yAxis,
                title: chartConfig.title,
                message: chartConfig.message,
            }

            setCustomCharts((prev) => [...prev.slice(-4), newChart]) // Keep last 5 charts
        } catch (error) {
            console.error("Chart generation error:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    const renderCustomChart = (chart: CustomChart) => {
        const chartData = data.map((row) => ({
            [chart.xAxis]: row[chart.xAxis],
            [chart.yAxis]: row[chart.yAxis],
        }))

        if (chart.type === "pie") {
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey={chart.yAxis}
                            nameKey={chart.xAxis}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
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
        }

        if (chart.type === "scatter") {
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis dataKey={chart.xAxis} stroke="rgba(148, 163, 184, 0.5)" />
                        <YAxis dataKey={chart.yAxis} stroke="rgba(148, 163, 184, 0.5)" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(30, 41, 59, 0.9)",
                                border: "1px solid rgba(148, 163, 184, 0.2)",
                            }}
                        />
                        <Scatter data={chartData} fill={COLORS[0]} />
                    </ScatterChart>
                </ResponsiveContainer>
            )
        }

        const ChartComponent = {
            bar: BarChart,
            line: LineChart,
            area: AreaChart,
        }[chart.type] || BarChart

        const DataComponent = {
            bar: Bar,
            line: Line,
            area: Area,
        }[chart.type] || Bar

        return (
            <ResponsiveContainer width="100%" height={300}>
                <ChartComponent data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey={chart.xAxis} stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(30, 41, 59, 0.9)",
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                        }}
                    />
                    <Legend />
                    {chart.type === "line" ? (
                        <DataComponent type="monotone" dataKey={chart.yAxis} stroke={COLORS[0]} strokeWidth={2} />
                    ) : chart.type === "area" ? (
                        <DataComponent type="monotone" dataKey={chart.yAxis} fill={COLORS[0]} stroke={COLORS[0]} fillOpacity={0.6} />
                    ) : (
                        <DataComponent dataKey={chart.yAxis} fill={COLORS[0]} />
                    )}
                </ChartComponent>
            </ResponsiveContainer>
        )
    }

    return (
        <div className="border-t border-surface-light/20 pt-8 mt-8">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-bold">Request Custom Visualization</h3>
            </div>
            <p className="text-sm text-muted mb-6">
                Ask AI to create specific charts using natural language. Example: "Show me a bar chart of sales by region"
            </p>

            {/* Chat Input */}
            <Card className="glass-effect border-surface-light/20 mb-6">
                <CardContent className="pt-6">
                    <div className="flex gap-2">
                        <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleGenerateChart()}
                            placeholder="Describe the chart you want... (e.g., 'line chart of temperature over time')"
                            className="bg-surface/50 border-surface-light/20"
                            disabled={isGenerating}
                        />
                        <Button
                            onClick={handleGenerateChart}
                            disabled={isGenerating || !chatInput.trim()}
                            className="bg-primary hover:bg-primary-dark gap-2"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Custom Charts Display */}
            {customCharts.length > 0 && (
                <div className="space-y-4">
                    {customCharts.map((chart) => (
                        <Card key={chart.id} className="glass-effect border-surface-light/20">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{chart.title}</CardTitle>
                                    <Badge variant="outline">{chart.type} chart</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{chart.message}</p>
                            </CardHeader>
                            <CardContent>{renderCustomChart(chart)}</CardContent>
                        </Card>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            )}

            {customCharts.length === 0 && (
                <Card className="glass-effect border-surface-light/20">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Sparkles className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                        <p className="text-muted">No custom charts yet. Type a request above to get started!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
