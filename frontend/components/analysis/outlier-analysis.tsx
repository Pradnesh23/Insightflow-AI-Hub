"use client"

import { useState, useEffect } from "react"
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
  savedResult?: any
  onResultUpdate?: (result: any) => void
}

export function OutlierAnalysis({ datasetId, data, columns, savedResult, onResultUpdate }: OutlierAnalysisProps) {
  const [outliers, setOutliers] = useState<Record<string, any> | null>(savedResult?.outliers || null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (savedResult?.outliers) {
      setOutliers(savedResult.outliers)
    }
  }, [savedResult])

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
      console.log("Outlier result:", result)
      setOutliers(result.result_data?.outliers || null)
      if (onResultUpdate) {
        onResultUpdate(result.result_data)
      }
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const scatterData = outliers && typeof outliers === 'object'
    ? Object.entries(outliers)
      .flatMap(([column, analysis]: [string, any]) => {
        // Safely handle different response formats
        if (!analysis || typeof analysis !== 'object') return []

        const outlierArray = analysis.outliers || analysis.values || []
        if (!Array.isArray(outlierArray)) return []

        return outlierArray.map((item: any, index: number) => ({
          x: item.index !== undefined ? item.index : index,
          y: typeof item === 'number' ? item : (item.value || 0),
          column,
          isOutlier: item.isOutlier !== undefined ? item.isOutlier : true,
        }))
      })
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

      {outliers && typeof outliers === 'object' && Object.keys(outliers).length > 0 ? (
        <>
          {/* Box Plot Visualization */}
          <Card className="glass-effect border-surface-light/20">
            <CardHeader>
              <CardTitle>Box Plot - Quartile Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(outliers).map(([column, analysis]: [string, any]) => {
                  if (!analysis?.quartiles) return null

                  const { Q1, Q3, IQR } = analysis.quartiles
                  const { lower, upper } = analysis.bounds || {}
                  const median = analysis.median || (Q1 + Q3) / 2

                  return (
                    <div key={column} className="space-y-2">
                      <h4 className="font-semibold text-sm">{column}</h4>
                      <div className="relative h-20 bg-surface/30 rounded-lg p-4">
                        {/* Whiskers (bounds) */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted" style={{
                          left: '10%',
                          right: '10%'
                        }} />

                        {/* Box (Q1 to Q3) */}
                        <div className="absolute top-1/4 h-1/2 bg-primary/30 border-2 border-primary rounded" style={{
                          left: `${20 + ((Q1 - lower) / (upper - lower)) * 60}%`,
                          width: `${((Q3 - Q1) / (upper - lower)) * 60}%`
                        }} />

                        {/* Median line */}
                        <div className="absolute top-1/4 h-1/2 w-0.5 bg-accent" style={{
                          left: `${20 + ((median - lower) / (upper - lower)) * 60}%`
                        }} />

                        {/* Labels */}
                        <div className="absolute -bottom-6 left-0 text-xs text-foreground font-semibold">
                          {lower?.toFixed(2)}
                        </div>
                        <div className="absolute -bottom-6 right-0 text-xs text-foreground font-semibold">
                          {upper?.toFixed(2)}
                        </div>
                        <div className="absolute -top-6 text-xs text-cyan-400 font-semibold" style={{
                          left: `${20 + ((Q1 - lower) / (upper - lower)) * 60}%`
                        }}>
                          Q1: {Q1?.toFixed(2)}
                        </div>
                        <div className="absolute -top-6 text-xs text-accent font-bold" style={{
                          left: `${20 + ((median - lower) / (upper - lower)) * 60}%`
                        }}>
                          Median: {median?.toFixed(2)}
                        </div>
                        <div className="absolute -top-6 text-xs text-cyan-400 font-semibold" style={{
                          left: `${20 + ((Q3 - lower) / (upper - lower)) * 60}%`
                        }}>
                          Q3: {Q3?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Outlier Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(outliers).map(([column, analysis]: [string, any]) => {
              // Safely extract values with defaults
              const count = analysis?.count || 0
              const lowerBound = analysis?.bounds?.lower || analysis?.percentage || 0
              const upperBound = analysis?.bounds?.upper || 0

              return (
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
                      <span className="font-semibold ml-2 text-warning">{count}</span>
                    </div>
                    {analysis?.percentage !== undefined && (
                      <div className="text-sm">
                        <span className="text-muted">Percentage:</span>
                        <span className="font-semibold ml-2">{typeof analysis.percentage === 'number' ? analysis.percentage.toFixed(1) : analysis.percentage}%</span>
                      </div>
                    )}
                    {analysis?.bounds && (
                      <>
                        <div className="text-sm">
                          <span className="text-muted">Lower Bound:</span>
                          <span className="font-semibold ml-2">{typeof lowerBound === 'number' ? lowerBound.toFixed(2) : lowerBound}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted">Upper Bound:</span>
                          <span className="font-semibold ml-2">{typeof upperBound === 'number' ? upperBound.toFixed(2) : upperBound}</span>
                        </div>
                      </>
                    )}
                    <div className="text-xs text-muted mt-4">
                      {count > 0
                        ? `${((count / data.length) * 100).toFixed(1)}% of data points are outliers`
                        : "No outliers detected"}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
