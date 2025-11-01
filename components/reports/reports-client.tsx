"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Loader2, Download } from "lucide-react"

interface Dataset {
  id: string
  name: string
}

interface Report {
  id: string
  title: string
  report_type: string
  created_at: string
  content: any
}

export function ReportsClient({ datasets, initialReports }: { datasets: Dataset[]; initialReports: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [selectedDataset, setSelectedDataset] = useState<string>("")
  const [reportType, setReportType] = useState<string>("analysis")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateReport = async () => {
    if (!selectedDataset) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId: selectedDataset,
          reportType,
          title,
          description,
        }),
      })

      if (!response.ok) throw new Error("Report generation failed")
      const newReport = await response.json()
      setReports([newReport, ...reports])
      setTitle("")
      setDescription("")
    } catch (error) {
      console.error("Error:", error)
      alert("Report generation failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Create a professional report from your dataset analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataset">Dataset</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analysis">Analysis Report</SelectItem>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="technical">Technical Report</SelectItem>
                  <SelectItem value="business">Business Intelligence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter report title"
              className="bg-slate-700 border-slate-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter report description"
              className="bg-slate-700 border-slate-600"
              rows={3}
            />
          </div>
          <Button
            onClick={handleGenerateReport}
            disabled={!selectedDataset || isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-cyan-400">Generated Reports</h2>
        {reports.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardContent className="pt-6 text-center text-slate-400">
              No reports generated yet. Create your first report above.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-cyan-400" />
                        {report.title}
                      </CardTitle>
                      <CardDescription>
                        {report.report_type} • {new Date(report.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
