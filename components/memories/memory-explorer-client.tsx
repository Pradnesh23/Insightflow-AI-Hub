"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Search, Brain, Calendar, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

interface Memory {
  id: string
  memory_type: string
  content: string
  metadata: Record<string, any>
  created_at: string
}

interface MemoryExplorerClientProps {
  initialMemories: Memory[]
  userId: string
}

export function MemoryExplorerClient({ initialMemories, userId }: MemoryExplorerClientProps) {
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isCleaningUp, setIsCleaningUp] = useState(false)

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || memory.memory_type === selectedType
    return matchesSearch && matchesType
  })

  const memoryTypes = Array.from(new Set(memories.map((m) => m.memory_type)))

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/memories/${id}`, { method: "DELETE" })
      setMemories(memories.filter((m) => m.id !== id))
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const handleCleanupOldMemories = async () => {
    if (!confirm("This will delete all old 'insight' and 'meeting_agenda' type memories. Meeting memories will be preserved. Continue?")) {
      return
    }

    setIsCleaningUp(true)
    try {
      const oldMemories = memories.filter((m) => m.memory_type === "insight" || m.memory_type === "meeting_agenda")
      
      for (const memory of oldMemories) {
        await fetch(`/api/memories/${memory.id}`, { method: "DELETE" })
      }
      
      setMemories(memories.filter((m) => m.memory_type !== "insight" && m.memory_type !== "meeting_agenda"))
      alert(`Successfully deleted ${oldMemories.length} old memories`)
    } catch (error) {
      console.error("Cleanup error:", error)
      alert("Failed to cleanup old memories")
    } finally {
      setIsCleaningUp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold gradient-text">Memory Explorer</h1>
            {memories.some((m) => m.memory_type === "insight" || m.memory_type === "meeting_agenda") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanupOldMemories}
                disabled={isCleaningUp}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isCleaningUp ? "Cleaning up..." : "Cleanup Old Memories"}
              </Button>
            )}
          </div>
          <p className="text-muted">Browse and manage your saved insights and preferences</p>
        </div>

        {/* Search and Filter */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="pl-10 bg-surface/50 border-surface-light/20"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              onClick={() => setSelectedType(null)}
              size="sm"
            >
              All
            </Button>
            {memoryTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                size="sm"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Memories Grid */}
        {filteredMemories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemories.map((memory) => {
              const isMeeting = memory.memory_type === "meeting"
              const meetingId = memory.metadata?.meeting_id

              return isMeeting && meetingId ? (
                <Link key={memory.id} href={`/meeting/${meetingId}`}>
                  <Card
                    className="glass-effect border-surface-light/20 transition-all h-full hover:border-accent/50 hover:shadow-lg cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              Meeting
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1">
                              <Calendar className="w-3 h-3" />
                              Click to view
                            </Badge>
                          </div>
                          <CardTitle className="text-base line-clamp-2">
                            {memory.content}
                          </CardTitle>
                        </div>
                        <ExternalLink className="w-5 h-5 text-accent flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {memory.metadata?.company_name && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Company:</span> {memory.metadata.company_name}
                        </p>
                      )}
                      
                      {memory.metadata?.participants && memory.metadata.participants.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-1">Participants:</p>
                          <div className="flex flex-wrap gap-1">
                            {memory.metadata.participants.slice(0, 3).map((participant: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {participant}
                              </Badge>
                            ))}
                            {memory.metadata.participants.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{memory.metadata.participants.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {memory.metadata?.agenda_preview && (
                        <p className="text-sm text-muted line-clamp-2">
                          {memory.metadata.agenda_preview}...
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-surface-light/20">
                        <span className="text-xs text-muted">
                          {formatDate(memory.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card
                  key={memory.id}
                  className="glass-effect border-surface-light/20 hover:border-primary/30 transition-colors h-full"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {memory.memory_type}
                        </Badge>
                        <CardTitle className="text-base line-clamp-2">
                          {memory.content}
                        </CardTitle>
                      </div>
                      <Brain className="w-5 h-5 text-accent flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {memory.metadata?.company_name && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Company:</span> {memory.metadata.company_name}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-surface-light/20">
                      <span className="text-xs text-muted">
                        {formatDate(memory.created_at)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(memory.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="glass-effect border-surface-light/20">
            <CardContent className="pt-12 text-center">
              <Brain className="w-12 h-12 text-muted/30 mx-auto mb-4" />
              <p className="text-muted">No memories found. Start saving insights from your analysis!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
