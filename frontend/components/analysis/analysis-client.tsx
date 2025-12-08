"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, BarChart3, TrendingUp, AlertTriangle, MessageSquare, ArrowLeft, Zap, CheckCircle } from "lucide-react"
import Link from "next/link"
import { StatisticalAnalysis } from "./statistical-analysis"
import { CorrelationAnalysis } from "./correlation-analysis"
import { OutlierAnalysis } from "./outlier-analysis"
import { AIChat } from "./ai-chat"
import { AdvancedVisualizer } from "./advanced-visualizer"
import { QualityReport } from "./quality-report"

interface Dataset {
  id: string
  name: string
  file_path: string
  columns: Array<{ name: string; type: string }>
}

export function AnalysisClient({ dataset, userId }: { dataset: Dataset; userId: string }) {
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("quality")

  // Shared state for analysis results - persists across tab switches
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({})

  const updateAnalysisResult = (type: string, result: any) => {
    setAnalysisResults(prev => ({ ...prev, [type]: result }))
  }

  useEffect(() => {
    // In a real app, you'd fetch the actual data from storage
    // For now, we'll use sample data with more rows for better analysis
    const rowCount = (dataset as any).row_count || 1000
    const sampleData = generateSampleData(dataset.columns, rowCount)
    setData(sampleData)
    setIsLoading(false)
  }, [dataset])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-muted">Loading analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Header */}
      <header className="glass-effect border-b border-surface-light/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold gradient-text">{dataset.name}</h1>
              <p className="text-sm text-muted">{data.length} rows</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 glass-effect border-surface-light/20">
            <TabsTrigger value="quality" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Quality</span>
            </TabsTrigger>
            <TabsTrigger value="statistical" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="visualizer" className="gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Visualizer</span>
            </TabsTrigger>
            <TabsTrigger value="correlation" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Correlation</span>
            </TabsTrigger>
            <TabsTrigger value="outliers" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Outliers</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quality" className="mt-8">
            <QualityReport
              datasetId={dataset.id}
              data={data}
              columns={dataset.columns}
              savedResult={analysisResults.quality}
              onResultUpdate={(result) => updateAnalysisResult('quality', result)}
            />
          </TabsContent>

          <TabsContent value="statistical" className="mt-8">
            <StatisticalAnalysis
              datasetId={dataset.id}
              data={data}
              columns={dataset.columns}
              savedResult={analysisResults.statistical}
              onResultUpdate={(result) => updateAnalysisResult('statistical', result)}
            />
          </TabsContent>

          <TabsContent value="visualizer" className="mt-8">
            <AdvancedVisualizer data={data} columns={dataset.columns} />
          </TabsContent>

          <TabsContent value="correlation" className="mt-8">
            <CorrelationAnalysis
              datasetId={dataset.id}
              data={data}
              columns={dataset.columns}
              savedResult={analysisResults.correlation}
              onResultUpdate={(result) => updateAnalysisResult('correlation', result)}
            />
          </TabsContent>

          <TabsContent value="outliers" className="mt-8">
            <OutlierAnalysis
              datasetId={dataset.id}
              data={data}
              columns={dataset.columns}
              savedResult={analysisResults.outliers}
              onResultUpdate={(result) => updateAnalysisResult('outliers', result)}
            />
          </TabsContent>

          <TabsContent value="chat" className="mt-8">
            <AIChat
              datasetId={dataset.id}
              data={data}
              columns={dataset.columns}
              savedMessages={analysisResults.chat}
              onMessagesUpdate={(messages) => updateAnalysisResult('chat', messages)}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function generateSampleData(columns: Array<{ name: string; type: string }>, rows: number) {
  const data = []
  for (let i = 0; i < rows; i++) {
    const row: Record<string, unknown> = {}
    columns.forEach((col) => {
      if (col.type === "number") {
        row[col.name] = Math.random() * 100
      } else {
        row[col.name] = `Value ${i}`
      }
    })
    data.push(row)
  }
  return data
}
