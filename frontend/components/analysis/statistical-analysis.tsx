"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Column {
  name: string
  type: string
}

interface StatisticalAnalysisProps {
  datasetId: string
  data: Record<string, unknown>[]
  columns: Column[]
  savedResult?: any
  onResultUpdate?: (result: any) => void
}

export function StatisticalAnalysis({ datasetId, data, columns, savedResult, onResultUpdate }: StatisticalAnalysisProps) {
  const [stats, setStats] = useState<Record<string, any> | null>(savedResult?.statistics || null)
  const [isLoading, setIsLoading] = useState(false)

  // Update local state when saved result changes
  useEffect(() => {
    if (savedResult?.statistics) {
      setStats(savedResult.statistics)
    }
  }, [savedResult])

  const handleAnalyze = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analysis/statistical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId,
          data,
          columns: columns.map((c) => c.name),
        }),
      })
      const result = await response.json()
      console.log("Statistical result:", result)
      setStats(result.result_data?.statistics || null)
      // Notify parent component
      if (onResultUpdate) {
        onResultUpdate(result.result_data)
      }
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const chartData = stats
    ? Object.entries(stats).map(([column, columnStats]: [string, any]) => ({
      name: column,
      mean: columnStats.mean,
      median: columnStats.median,
      stdDev: columnStats.std,
    }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistical Analysis</h2>
        <Button onClick={handleAnalyze} disabled={isLoading} className="bg-primary hover:bg-primary-dark gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Analyzing..." : "Run Analysis"}
        </Button>
      </div>

      {stats ? (
        <>
          <Card className="glass-effect border-surface-light/20">
            <CardHeader>
              <CardTitle>Mean vs Median Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                  <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 41, 59, 0.9)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="mean" fill="#8b5cf6" />
                  <Bar dataKey="median" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(stats).map(([column, columnStats]: [string, any]) => (
              <Card key={column} className="glass-effect border-surface-light/20">
                <CardHeader>
                  <CardTitle className="text-lg">{column}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted">Mean:</span>
                    <span className="font-semibold ml-2">{columnStats.mean?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Median:</span>
                    <span className="font-semibold ml-2">{columnStats.median?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Std Dev:</span>
                    <span className="font-semibold ml-2">{columnStats.std?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Min:</span>
                    <span className="font-semibold ml-2">{columnStats.min?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Max:</span>
                    <span className="font-semibold ml-2">{columnStats.max?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Count:</span>
                    <span className="font-semibold ml-2">{columnStats.count || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="glass-effect border-surface-light/20">
          <CardContent className="pt-12 text-center">
            <p className="text-muted mb-4">Click "Run Analysis" to generate statistical insights</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
