"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, BarChart3, TrendingUp, AlertTriangle, MessageSquare, ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"
import { StatisticalAnalysis } from "./statistical-analysis"
import { CorrelationAnalysis } from "./correlation-analysis"
import { OutlierAnalysis } from "./outlier-analysis"
import { AIChat } from "./ai-chat"
import { AdvancedVisualizer } from "./advanced-visualizer"

interface Dataset {
  id: string
  name: string
  file_path: string
  columns: Array<{ name: string; type: string }>
}

export function AnalysisClient({ dataset, userId }: { dataset: Dataset; userId: string }) {
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("statistical")

  useEffect(() => {
    // In a real app, you'd fetch the actual data from storage
    // For now, we'll use sample data
    const sampleData = generateSampleData(dataset.columns, 100)
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
          <TabsList className="grid w-full grid-cols-5 glass-effect border-surface-light/20">
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

          <TabsContent value="statistical" className="mt-8">
            <StatisticalAnalysis datasetId={dataset.id} data={data} columns={dataset.columns} />
          </TabsContent>

          <TabsContent value="visualizer" className="mt-8">
            <AdvancedVisualizer data={data} columns={dataset.columns} />
          </TabsContent>

          <TabsContent value="correlation" className="mt-8">
            <CorrelationAnalysis datasetId={dataset.id} data={data} columns={dataset.columns} />
          </TabsContent>

          <TabsContent value="outliers" className="mt-8">
            <OutlierAnalysis datasetId={dataset.id} data={data} columns={dataset.columns} />
          </TabsContent>

          <TabsContent value="chat" className="mt-8">
            <AIChat datasetId={dataset.id} data={data} columns={dataset.columns} />
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
