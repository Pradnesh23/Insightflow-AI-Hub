"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Plus, RefreshCw } from "lucide-react"

interface Dashboard {
  id: string
  title: string
  refresh_interval: number
}

interface Widget {
  id: string
  widget_type: string
  title: string
  config: any
  datasets: { name: string }
}

interface Dataset {
  id: string
  name: string
}

const COLORS = ["#06b6d4", "#a855f7", "#ec4899", "#f59e0b", "#10b981"]

export function DashboardDetailClient({
  dashboard,
  widgets: initialWidgets,
  datasets,
}: {
  dashboard: Dashboard
  widgets: Widget[]
  datasets: Dataset[]
}) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets)
  const [selectedDataset, setSelectedDataset] = useState<string>("")
  const [widgetType, setWidgetType] = useState<string>("chart")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddWidget = async () => {
    if (!selectedDataset) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/dashboards/${dashboard.id}/widgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId: selectedDataset,
          widgetType,
          title: `${widgetType} Widget`,
          config: { refreshInterval: dashboard.refresh_interval },
        }),
      })

      if (!response.ok) throw new Error("Failed to add widget")
      const newWidget = await response.json()
      setWidgets([...widgets, newWidget])
      setSelectedDataset("")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to add widget")
    } finally {
      setIsLoading(false)
    }
  }

  const mockData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 200 },
    { name: "Apr", value: 278 },
    { name: "May", value: 190 },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Add Widget</CardTitle>
          <CardDescription>Add a new widget to your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue placeholder="Select dataset..." />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={widgetType} onValueChange={setWidgetType}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="metric">Metric</SelectItem>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="gauge">Gauge</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddWidget}
              disabled={!selectedDataset || isLoading}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-cyan-400">Dashboard Widgets</h2>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {widgets.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-6 text-center text-slate-400">
            No widgets yet. Add your first widget above.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <Card key={widget.id} className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">{widget.title}</CardTitle>
                <CardDescription>{widget.datasets.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {widget.widget_type === "chart" && (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={mockData}>
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Bar dataKey="value" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {widget.widget_type === "metric" && (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-400">1,234</div>
                    <div className="text-sm text-slate-400 mt-2">Total Records</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
