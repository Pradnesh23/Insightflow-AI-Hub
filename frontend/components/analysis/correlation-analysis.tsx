"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface Column {
  name: string
  type: string
}

interface CorrelationAnalysisProps {
  datasetId: string
  data: Record<string, unknown>[]
  columns: Column[]
  savedResult?: any
  onResultUpdate?: (result: any) => void
}

export function CorrelationAnalysis({ datasetId, data, columns, savedResult, onResultUpdate }: CorrelationAnalysisProps) {
  const [correlations, setCorrelations] = useState<Record<string, Record<string, number>> | null>(savedResult?.correlations || null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (savedResult?.correlations) {
      setCorrelations(savedResult.correlations)
    }
  }, [savedResult])

  const handleAnalyze = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analysis/correlation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId,
          data,
          columns: columns.map((c) => c.name),
        }),
      })
      const result = await response.json()
      console.log("Correlation result:", result)
      setCorrelations(result.result_data?.correlations || null)
      if (onResultUpdate) {
        onResultUpdate(result.result_data)
      }
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const numericColumns = columns.filter((col) => {
    const values = data.map((row) => row[col.name]).filter((v) => v !== null && v !== "")
    return values.length > 0 && !isNaN(Number(values[0]))
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Correlation Matrix</h2>
        <Button onClick={handleAnalyze} disabled={isLoading} className="bg-primary hover:bg-primary-dark gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Analyzing..." : "Run Analysis"}
        </Button>
      </div>

      {correlations ? (
        <>
          <Card className="glass-effect border-surface-light/20">
            <CardHeader>
              <CardTitle>Correlation Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-light/20">
                    <th className="text-left py-2 px-4 font-semibold">Variable</th>
                    {Object.keys(correlations).map((col) => (
                      <th key={col} className="text-center py-2 px-4 font-semibold text-xs">
                        {col.substring(0, 8)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(correlations).map(([row, values]) => (
                    <tr key={row} className="border-b border-surface-light/20">
                      <td className="py-2 px-4 font-semibold text-xs">{row.substring(0, 8)}</td>
                      {Object.entries(values).map(([col, value]) => {
                        // Safely convert to number
                        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
                        if (isNaN(numValue)) return <td key={`${row}-${col}`} className="text-center py-2 px-4">-</td>

                        const absValue = Math.abs(numValue)
                        const hue = numValue > 0 ? 120 : 0
                        return (
                          <td
                            key={`${row}-${col}`}
                            className="text-center py-2 px-4 font-semibold"
                            style={{
                              backgroundColor: `hsla(${hue}, 100%, 50%, ${absValue * 0.3})`,
                              color: absValue > 0.5 ? "white" : "inherit",
                            }}
                          >
                            {numValue.toFixed(2)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Correlation Insights */}
          <Card className="glass-effect border-surface-light/20">
            <CardHeader>
              <CardTitle>Strong Correlations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(correlations)
                  .flatMap(([col1, values]) =>
                    Object.entries(values)
                      .filter(([col2, value]) => {
                        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
                        return col1 < col2 && !isNaN(numValue) && Math.abs(numValue) > 0.7
                      })
                      .map(([col2, value]) => ({
                        col1,
                        col2,
                        value: typeof value === 'number' ? value : parseFloat(String(value)),
                      })),
                  )
                  .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                  .slice(0, 5)
                  .map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-surface/50 rounded-lg">
                      <span className="text-sm">
                        {item.col1} ↔ {item.col2}
                      </span>
                      <span className={`font-semibold ${item.value > 0 ? "text-success" : "text-error"}`}>
                        {item.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="glass-effect border-surface-light/20">
          <CardContent className="pt-12 text-center">
            <p className="text-muted mb-4">Click "Run Analysis" to generate correlation matrix</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
