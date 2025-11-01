"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Upload,
  X,
  FileText,
  Building2,
} from "lucide-react"

interface MeetingAgentClientProps {
  userId: string
}

interface AgendaItem {
  time: string
  duration: string
  title: string
  presenter: string
  points: string[]
}

interface ResearchSection {
  title: string
  items: string[]
}

export function MeetingAgentClient({ userId }: MeetingAgentClientProps) {
  const [companyName, setCompanyName] = useState("")
  const [topic, setTopic] = useState("")
  const [context, setContext] = useState("")
  const [participants, setParticipants] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      return validTypes.includes(file.type) || file.name.endsWith(".docx") || file.name.endsWith(".xlsx")
    })
    setUploadedFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerateMeeting = async () => {
    if (!topic.trim() || !companyName.trim()) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("companyName", companyName)
      formData.append("topic", topic)
      formData.append("context", context)
      formData.append("participants", participants)

      uploadedFiles.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/meeting-agent", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const parseAgendaItems = (agendaText: string | undefined): AgendaItem[] => {
    if (!agendaText || typeof agendaText !== "string") {
      return []
    }

    const items: AgendaItem[] = []
    const lines = agendaText.split("\n")
    let currentItem: AgendaItem | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Match multiple time formats:
      // Format 1: 10:00-10:15 (15 min) **Title**
      // Format 2: **Title** - 10:00-10:15 (15 min)
      const timeMatch1 = line.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s*\((\d+)\s*min\)\s*\*\*(.+?)\*\*/)
      const timeMatch2 = line.match(/\*\*(.+?)\*\*.*?(\d{1,2}:\d{2})-(\d{1,2}:\d{2}).*?\((\d+)\s*min\)/)
      
      if (timeMatch1) {
        // Save previous item if exists
        if (currentItem) {
          items.push(currentItem)
        }
        
        const [, startTime, endTime, duration, title] = timeMatch1
        currentItem = {
          time: `${startTime}-${endTime}`,
          duration: `${duration} min`,
          title: title.trim(),
          presenter: "",
          points: [],
        }
      } else if (timeMatch2) {
        // Save previous item if exists
        if (currentItem) {
          items.push(currentItem)
        }
        
        const [, title, startTime, endTime, duration] = timeMatch2
        currentItem = {
          time: `${startTime}-${endTime}`,
          duration: `${duration} min`,
          title: title.trim(),
          presenter: "",
          points: [],
        }
      } else if (currentItem && (line.match(/^[•\-*]\s+/) || line.match(/^\d+\.\s+/))) {
        // This is a discussion point for the current item (bullet or numbered)
        const point = line.replace(/^[•\-*]\s+/, "").replace(/^\d+\.\s+/, "").trim()
        if (point && point.length > 3) {
          currentItem.points.push(point)
        }
      }
    }

    // Add the last item
    if (currentItem) {
      items.push(currentItem)
    }

    return items
  }

  const agendaItems = result ? parseAgendaItems(result.agenda) : []

  const parseResearchSections = (researchText: string | undefined) => {
    if (!researchText || typeof researchText !== "string") {
      return {
        "Industry Trends": [],
        "Best Practices": [],
        Challenges: [],
        Recommendations: [],
      }
    }

    const sections: { [key: string]: string[] } = {
      "Industry Trends": [],
      "Best Practices": [],
      Challenges: [],
      Recommendations: [],
    }

    const lines = researchText.split("\n")
    let currentSection = ""

    lines.forEach((line) => {
      if (line.includes("Industry Trends") || line.includes("Trends")) {
        currentSection = "Industry Trends"
      } else if (line.includes("Best Practices") || line.includes("Practices")) {
        currentSection = "Best Practices"
      } else if (line.includes("Challenge") || line.includes("Risk")) {
        currentSection = "Challenges"
      } else if (line.includes("Recommendation") || line.includes("Action")) {
        currentSection = "Recommendations"
      } else if (line.trim() && (line.includes("•") || line.includes("-") || line.includes("*"))) {
        if (currentSection && sections[currentSection]) {
          sections[currentSection].push(line.replace(/^[•\-*]\s*/, "").trim())
        }
      }
    })

    return sections
  }

  const researchSections = result ? parseResearchSections(result.research) : {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Meeting Agent</h1>
          <p className="text-muted">Prepare for meetings with AI-generated agendas and research</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-surface-light/20 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Meeting Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-accent" />
                    Company Name
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="bg-surface/50 border-surface-light/20 focus:border-primary focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Meeting Topic</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Q4 Planning Session"
                    className="bg-surface/50 border-surface-light/20 focus:border-primary focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Context</label>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Additional context or background..."
                    className="bg-surface/50 border-surface-light/20 focus:border-primary focus:ring-primary/50 h-24"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Participants</label>
                  <Input
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="John, Sarah, Mike (comma-separated)"
                    className="bg-surface/50 border-surface-light/20 focus:border-primary focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Upload className="w-4 h-4 text-accent" />
                    Company Files (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.csv,.xlsx,.xls,.docx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="block w-full p-3 border-2 border-dashed border-surface-light/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors text-center text-sm text-muted"
                    >
                      Click to upload files
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-surface/50 p-2 rounded border border-surface-light/20"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="text-xs truncate">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(idx)}
                            className="ml-2 p-1 hover:bg-surface-light/20 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-muted" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleGenerateMeeting}
                  disabled={isLoading || !topic.trim() || !companyName.trim()}
                  className="w-full bg-primary hover:bg-primary-dark gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Meeting"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {result ? (
              <>
                <Card className="glass-effect border-surface-light/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" />
                      Meeting Agenda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {agendaItems.length > 0 ? (
                      <div className="space-y-3">
                        {agendaItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex gap-4 pb-4 border-b border-surface-light/10 last:border-0 last:pb-0 hover:bg-surface/30 p-4 rounded-lg transition-colors"
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                                {idx + 1}
                              </div>
                              {idx < agendaItems.length - 1 && <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/50 to-transparent mt-2" />}
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-foreground text-lg">{item.title}</h3>
                                <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full whitespace-nowrap ml-2 font-medium">
                                  {item.duration}
                                </span>
                              </div>
                              <p className="text-sm text-muted mb-3 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {item.time}
                              </p>
                              {item.points.length > 0 && (
                                <div className="mt-3 space-y-2 bg-surface/30 p-3 rounded-lg border border-surface-light/10">
                                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Discussion Points:</p>
                                  <ul className="space-y-2">
                                    {item.points.map((point, pidx) => (
                                      <li key={pidx} className="text-sm text-muted-foreground flex gap-2 items-start">
                                        <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap">{result.agenda}</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-effect border-surface-light/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Research & Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Industry Trends */}
                      {researchSections["Industry Trends"]?.length > 0 && (
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Industry Trends
                          </h3>
                          <ul className="space-y-2">
                            {researchSections["Industry Trends"].map((item, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-primary">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Best Practices */}
                      {researchSections["Best Practices"]?.length > 0 && (
                        <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-4 rounded-lg border border-accent/20">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent" />
                            Best Practices
                          </h3>
                          <ul className="space-y-2">
                            {researchSections["Best Practices"].map((item, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-accent">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Challenges */}
                      {researchSections["Challenges"]?.length > 0 && (
                        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 p-4 rounded-lg border border-red-500/20">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Potential Challenges
                          </h3>
                          <ul className="space-y-2">
                            {researchSections["Challenges"].map((item, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-red-500">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {researchSections["Recommendations"]?.length > 0 && (
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-lg border border-green-500/20">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Recommendations
                          </h3>
                          <ul className="space-y-2">
                            {researchSections["Recommendations"].map((item, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-green-500">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass-effect border-surface-light/20">
                <CardContent className="pt-12 text-center">
                  <Calendar className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                  <p className="text-muted">
                    Fill in the meeting details and click "Generate Meeting" to create an agenda
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
