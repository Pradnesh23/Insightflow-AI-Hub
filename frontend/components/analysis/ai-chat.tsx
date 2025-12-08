"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Loader2, Lightbulb, Save } from "lucide-react"

interface Column {
  name: string
  type: string
}

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AIChatProps {
  datasetId: string
  data: Record<string, unknown>[]
  columns: Column[]
  savedMessages?: Message[]
  onMessagesUpdate?: (messages: Message[]) => void
}

export function AIChat({ datasetId, data, columns, savedMessages, onMessagesUpdate }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>(savedMessages || [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isInternalUpdate = useRef(false)

  // Update local state when saved messages change
  useEffect(() => {
    if (savedMessages && !isInternalUpdate.current) {
      setMessages(savedMessages)
    }
    isInternalUpdate.current = false
  }, [savedMessages])

  // Notify parent when messages change (only for internal updates)
  useEffect(() => {
    if (messages.length > 0 && onMessagesUpdate && isInternalUpdate.current) {
      onMessagesUpdate(messages)
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput("")
    isInternalUpdate.current = true
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          datasetId,
          context: {
            columns: columns.map((c) => c.name),
            rowCount: data.length,
          },
        }),
      })

      const result = await response.json()
      const assistantMessage = result.message

      isInternalUpdate.current = true
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }])

      // Extract and save insights
      if (assistantMessage.includes("insight") || assistantMessage.includes("pattern")) {
        setInsights((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }])
    } finally {
      setIsLoading(false)
    }
  }

  const saveInsight = async (insight: string) => {
    try {
      await fetch("/api/memories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memoryType: "insight",
          content: insight,
          metadata: { datasetId },
        }),
      })
      alert("Insight saved!")
    } catch (error) {
      console.error("Save error:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI Data Assistant</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2">
          <Card className="glass-effect border-surface-light/20 h-96 flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-muted mb-2">Ask me anything about your data!</p>
                    <p className="text-sm text-muted/70">
                      I can help you understand patterns, correlations, and insights.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface text-foreground border border-surface-light/20"
                          }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-surface text-foreground border border-surface-light/20 px-4 py-2 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            <div className="border-t border-surface-light/20 p-4 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your data..."
                className="bg-surface/50 border-surface-light/20"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading} className="bg-primary hover:bg-primary-dark gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </Card>
        </div>

        {/* Insights Sidebar */}
        <div>
          <Card className="glass-effect border-surface-light/20 h-96 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3">
              {insights.length === 0 ? (
                <p className="text-sm text-muted">Insights will appear here</p>
              ) : (
                insights.map((insight, i) => (
                  <div key={i} className="p-3 bg-surface/50 rounded-lg border border-surface-light/20 space-y-2">
                    <p className="text-sm line-clamp-3">{insight}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveInsight(insight)}
                      className="w-full gap-2 text-xs"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
