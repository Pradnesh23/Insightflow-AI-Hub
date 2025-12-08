"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react"

interface Dataset {
  id: string
  name: string
}

interface ScheduledReport {
  id: string
  title: string
  frequency: string
  time_of_day: string
  email_recipients: string[]
  is_active: boolean
  next_run_at: string
}

export function ScheduledReportsClient({
  datasets,
  initialReports,
}: {
  datasets: Dataset[]
  initialReports: ScheduledReport[]
}) {
  const [reports, setReports] = useState<ScheduledReport[]>(initialReports)
  const [selectedDataset, setSelectedDataset] = useState<string>("")
  const [frequency, setFrequency] = useState<string>("daily")
  const [timeOfDay, setTimeOfDay] = useState<string>("09:00")
  const [emailRecipients, setEmailRecipients] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateSchedule = async () => {
    if (!selectedDataset || !title) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/scheduled-reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId: selectedDataset,
          title,
          frequency,
          timeOfDay,
          emailRecipients: emailRecipients.split(",").map((e) => e.trim()),
          reportType: "analysis",
        }),
      })

      if (!response.ok) throw new Error("Failed to create schedule")
      const newReport = await response.json()
      setReports([newReport, ...reports])
      setTitle("")
      setEmailRecipients("")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to create schedule")
    } finally {
      setIsLoading(false)
    }
  }

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      daily: "Every day",
      weekly: "Every week",
      monthly: "Every month",
    }
    return labels[freq] || freq
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Create Scheduled Report</CardTitle>
          <CardDescription>Set up automatic report generation and email delivery</CardDescription>
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
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter report title"
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time of Day</Label>
              <Input
                id="time"
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emails">Email Recipients (comma-separated)</Label>
            <Input
              id="emails"
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              className="bg-slate-700 border-slate-600"
            />
          </div>
          <Button
            onClick={handleCreateSchedule}
            disabled={!selectedDataset || !title || isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Create Schedule
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-cyan-400">Active Schedules</h2>
        {reports.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardContent className="pt-6 text-center text-slate-400">
              No scheduled reports yet. Create your first schedule above.
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
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-cyan-400" />
                        {report.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {getFrequencyLabel(report.frequency)} at {report.time_of_day}
                      </CardDescription>
                      <div className="mt-2 text-sm text-slate-400">
                        Next run: {new Date(report.next_run_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        {report.is_active ? (
                          <ToggleRight className="h-5 w-5 text-green-400" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-slate-500" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-5 w-5 text-red-400" />
                      </Button>
                    </div>
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
