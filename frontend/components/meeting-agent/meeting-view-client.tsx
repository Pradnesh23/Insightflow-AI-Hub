"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Clock, Users, Building2, ArrowLeft, TrendingUp, CheckCircle2, AlertCircle, Download, Trash2, FileText, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from "docx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import ReactMarkdown from "react-markdown"

interface Meeting {
  id: string
  company_name: string
  topic: string
  agenda: string
  research: string
  participants: string[]
  created_at: string
}

interface MeetingViewClientProps {
  meeting: Meeting
}

export function MeetingViewClient({ meeting }: MeetingViewClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this meeting? This will also remove it from Memory Explorer.")) {
      return
    }

    setIsDeleting(true)
    try {
      // Delete meeting from database
      await supabase.from("meetings").delete().eq("id", meeting.id)

      // Delete associated memory
      await supabase.from("memories").delete().eq("metadata->>meeting_id", meeting.id)

      router.push("/memories")
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete meeting")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = () => {
    setIsExporting(true)
    try {
      const exportData = {
        meeting: {
          topic: meeting.topic,
          company: meeting.company_name,
          participants: meeting.participants,
          date: new Date(meeting.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
        agenda: meeting.agenda,
        research: meeting.research,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `meeting-${meeting.topic.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export meeting")
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let yPos = 20

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text(meeting.topic, pageWidth / 2, yPos, { align: "center" })
      yPos += 15

      // Company and Date
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Company: ${meeting.company_name}`, 20, yPos)
      yPos += 7
      doc.text(`Date: ${new Date(meeting.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 20, yPos)
      yPos += 10

      // Participants
      if (meeting.participants.length > 0) {
        doc.text(`Participants: ${meeting.participants.join(", ")}`, 20, yPos)
        yPos += 15
      }

      // Agenda Section
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Meeting Agenda", 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const agendaLines = doc.splitTextToSize(meeting.agenda, pageWidth - 40)
      agendaLines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 20, yPos)
        yPos += 5
      })

      yPos += 10

      // Research Section
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Research & Insights", 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const researchLines = doc.splitTextToSize(meeting.research, pageWidth - 40)
      researchLines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 20, yPos)
        yPos += 5
      })

      doc.save(`meeting-${meeting.topic.replace(/\s+/g, "-").toLowerCase()}.pdf`)
    } catch (error) {
      console.error("PDF export error:", error)
      alert("Failed to export PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const exportToDOCX = async () => {
    setIsExporting(true)
    try {
      const doc = new Document({
        sections: [
          {
            children: [
              // Title
              new Paragraph({
                text: meeting.topic,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              // Company
              new Paragraph({
                children: [
                  new TextRun({ text: "Company: ", bold: true }),
                  new TextRun(meeting.company_name),
                ],
                spacing: { after: 100 },
              }),
              // Date
              new Paragraph({
                children: [
                  new TextRun({ text: "Date: ", bold: true }),
                  new TextRun(
                    new Date(meeting.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ),
                ],
                spacing: { after: 100 },
              }),
              // Participants
              new Paragraph({
                children: [
                  new TextRun({ text: "Participants: ", bold: true }),
                  new TextRun(meeting.participants.join(", ")),
                ],
                spacing: { after: 300 },
              }),
              // Agenda Header
              new Paragraph({
                text: "Meeting Agenda",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
              }),
              // Agenda Content
              ...meeting.agenda.split("\n").map(
                (line) =>
                  new Paragraph({
                    text: line,
                    spacing: { after: 100 },
                  })
              ),
              // Research Header
              new Paragraph({
                text: "Research & Insights",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
              }),
              // Research Content
              ...meeting.research.split("\n").map(
                (line) =>
                  new Paragraph({
                    text: line,
                    spacing: { after: 100 },
                  })
              ),
            ],
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `meeting-${meeting.topic.replace(/\s+/g, "-").toLowerCase()}.docx`)
    } catch (error) {
      console.error("DOCX export error:", error)
      alert("Failed to export DOCX")
    } finally {
      setIsExporting(false)
    }
  }

  const parseAgendaItems = (agendaText: string) => {
    const items: Array<{ time: string; duration: string; title: string; points: string[] }> = []
    const lines = agendaText.split("\n")
    let currentItem: any = null

    for (const line of lines) {
      const trimmed = line.trim()
      const timeMatch = trimmed.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s*\((\d+)\s*min\)\s*\*\*(.+?)\*\*/)

      if (timeMatch) {
        if (currentItem) items.push(currentItem)
        const [, start, end, duration, title] = timeMatch
        currentItem = {
          time: `${start}-${end}`,
          duration: `${duration} min`,
          title: title.trim(),
          points: [],
        }
      } else if (currentItem && trimmed.match(/^[•\-*]\s+/)) {
        const point = trimmed.replace(/^[•\-*]\s+/, "").trim()
        if (point) currentItem.points.push(point)
      }
    }
    if (currentItem) items.push(currentItem)
    return items
  }

  const parseResearchSections = (researchText: string) => {
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

  const agendaItems = parseAgendaItems(meeting.agenda)
  const researchSections = parseResearchSections(meeting.research)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background p-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/memories">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Memories
          </Button>
        </Link>

        {/* Meeting Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{meeting.topic}</h1>
              <div className="flex items-center gap-3 text-muted">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {meeting.company_name}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(meeting.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                {meeting.participants.length} Participants
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExporting} className="gap-2">
                    <Download className="w-4 h-4" />
                    {isExporting ? "Exporting..." : "Export"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToPDF} className="gap-2">
                    <FileText className="w-4 h-4" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToDOCX} className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Export as DOCX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>

          {meeting.participants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {meeting.participants.map((participant, idx) => (
                <Badge key={idx} variant="outline">
                  {participant}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Agenda */}
          <Card className="glass-effect border-surface-light/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Meeting Agenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agendaItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 pb-4 border-b border-surface-light/10 last:border-0 last:pb-0 p-3 rounded-lg hover:bg-surface/30 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                        {idx + 1}
                      </div>
                      {idx < agendaItems.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/50 to-transparent mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full whitespace-nowrap ml-2">
                          {item.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted mb-2">{item.time}</p>
                      {item.points.length > 0 && (
                        <ul className="space-y-1 mt-2">
                          {item.points.map((point, pidx) => (
                            <li key={pidx} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-accent">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Research & Insights */}
          <div className="space-y-6">
            <Card className="glass-effect border-surface-light/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Research & Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {researchSections["Industry Trends"]?.length > 0 && (
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Industry Trends
                    </h3>
                    <ul className="space-y-1">
                      {researchSections["Industry Trends"].map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span>
                          <ReactMarkdown>{item}</ReactMarkdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {researchSections["Best Practices"]?.length > 0 && (
                  <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-3 rounded-lg border border-accent/20">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      Best Practices
                    </h3>
                    <ul className="space-y-1">
                      {researchSections["Best Practices"].map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-accent">•</span>
                          <ReactMarkdown>{item}</ReactMarkdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {researchSections["Challenges"]?.length > 0 && (
                  <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 p-3 rounded-lg border border-red-500/20">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Challenges
                    </h3>
                    <ul className="space-y-1">
                      {researchSections["Challenges"].map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-red-500">•</span>
                          <ReactMarkdown>{item}</ReactMarkdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {researchSections["Recommendations"]?.length > 0 && (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-3 rounded-lg border border-green-500/20">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Recommendations
                    </h3>
                    <ul className="space-y-1">
                      {researchSections["Recommendations"].map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-green-500">•</span>
                          <ReactMarkdown>{item}</ReactMarkdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
