"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Loader2, TrendingUp } from "lucide-react"

interface Dataset {
  id: string
  name: string
  row_count: number
  column_count: number
}

interface QualityReport {
  id: string
  quality_score: number
  missing_values: Record<string, number>
  duplicate_rows: number
  outliers: Record<string, number>
  recommendations: string[]
}

export function DataQualityClient({ datasets }: { datasets: Dataset[] }) {
  const [selectedDataset, setSelectedDataset] = useState<string>("")
  const [report, setReport] = useState<QualityReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!selectedDataset) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/data-quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: selectedDataset }),
      })

      if (!response.ok) throw new Error("Analysis failed")
      const data = await response.json()
      setReport(data)
    } catch (error) {
      console.error("Error:", error)
      alert("Analysis failed")
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Select Dataset</CardTitle>
          <CardDescription>Choose a dataset to analyze its quality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedDataset} onValueChange={setSelectedDataset}>
            <SelectTrigger className="bg-slate-700 border-slate-600">
              <SelectValue placeholder="Select a dataset..." />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((ds) => (
                <SelectItem key={ds.id} value={ds.id}>
                  {ds.name} ({ds.row_count} rows, {ds.column_count} columns)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAnalyze}
            disabled={!selectedDataset || isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Analyze Quality
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-4">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quality Score</span>
                <span className={`text-3xl font-bold ${getScoreColor(report.quality_score)}`}>
                  {report.quality_score.toFixed(1)}%
                </span>
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Missing Values</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(report.missing_values).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(report.missing_values).map(([col, count]) => (
                      <div key={col} className="flex justify-between text-sm">
                        <span className="text-slate-400">{col}</span>
                        <span className="text-yellow-400">{count} rows</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    No missing values
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Duplicates & Outliers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Duplicate Rows</span>
                  <span className={report.duplicate_rows > 0 ? "text-yellow-400" : "text-green-400"}>
                    {report.duplicate_rows}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Outliers Detected</span>
                  <span className={Object.keys(report.outliers).length > 0 ? "text-yellow-400" : "text-green-400"}>
                    {Object.keys(report.outliers).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-cyan-400" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-300">
                    <span className="text-cyan-400">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
