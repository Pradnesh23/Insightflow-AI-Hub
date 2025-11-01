"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle } from "lucide-react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Column {
  name: string
  type: string
}

interface OutlierAnalysisProps {
  datasetId: string
  data: Record<string, unknown>[]
  columns: Column[]
}

export function OutlierAnalysis({ datasetId, data, columns }: OutlierAnalysisProps) {
  const [outliers, setOutliers] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analysis/outliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId,
          data,
          columns: columns.map((c) => c.name),
        }),
      })
      const result = await response.json()
      setOutliers(result.result_data)
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const scatterData = outliers
    ? Object.entries(outliers)
        .flatMap(([column, analysis]: [string, any]) =>
          analysis.outliers.map((item: any) => ({
            x: item.index,
            y: item.value,
            column,
            isOutlier: item.isOutlier,
          })),
        )
        .slice(0, 100)
    : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Outlier Detection</h2>
        <Button onClick={handleAnalyze} disabled={isLoading} className="bg-primary hover:bg-primary-dark gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Analyzing..." : "Run Analysis"}
        </Button>
      </div>

      {outliers ? (
        <>
          <Card className="glass-effect border-surface-light/20">
            <CardHeader>
              <CardTitle>Outlier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="x" stroke="rgba(148, 163, 184, 0.5)" />
                  <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 41, 59, 0.9)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Scatter
                    name="Normal"
                    data={scatterData.filter((d) => !d.isOutlier)}
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Scatter name="Outliers" data={scatterData.filter((d) => d.isOutlier)} fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Outlier Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(outliers).map(([column, analysis]: [string, any]) => (
              <Card key={column} className="glass-effect border-surface-light/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    {column}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted">Outliers Found:</span>
                    <span className="font-semibold ml-2 text-warning">{analysis.count}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Lower Bound:</span>
                    <span className="font-semibold ml-2">{analysis.bounds.lower.toFixed(2)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Upper Bound:</span>
                    <span className="font-semibold ml-2">{analysis.bounds.upper.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted mt-4">
                    {analysis.count > 0
                      ? `${((analysis.count / data.length) * 100).toFixed(1)}% of data points are outliers`
                      : "No outliers detected"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="glass-effect border-surface-light/20">
          <CardContent className="pt-12 text-center">
            <p className="text-muted mb-4">Click "Run Analysis" to detect outliers</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
