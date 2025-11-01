"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LayoutGrid, Loader2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface Dashboard {
  id: string
  title: string
  description: string
  created_at: string
  refresh_interval: number
}

interface Dataset {
  id: string
  name: string
}

export function DashboardsClient({
  dashboards: initialDashboards,
  datasets,
}: { dashboards: Dashboard[]; datasets: Dataset[] }) {
  const [dashboards, setDashboards] = useState<Dashboard[]>(initialDashboards)
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateDashboard = async () => {
    if (!title) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/dashboards/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) throw new Error("Failed to create dashboard")
      const newDashboard = await response.json()
      setDashboards([newDashboard, ...dashboards])
      setTitle("")
      setDescription("")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to create dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Create New Dashboard</CardTitle>
          <CardDescription>Build a custom dashboard to monitor your data in real-time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Dashboard Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter dashboard title"
              className="bg-slate-700 border-slate-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter dashboard description"
              className="bg-slate-700 border-slate-600"
              rows={3}
            />
          </div>
          <Button
            onClick={handleCreateDashboard}
            disabled={!title || isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Dashboard
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-cyan-400">Your Dashboards</h2>
        {dashboards.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardContent className="pt-6 text-center text-slate-400">
              No dashboards yet. Create your first dashboard above.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboards.map((dashboard) => (
              <Card
                key={dashboard.id}
                className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/dashboards/${dashboard.id}`}>
                        <CardTitle className="flex items-center gap-2 group-hover:text-cyan-400 transition">
                          <LayoutGrid className="h-5 w-5 text-cyan-400" />
                          {dashboard.title}
                        </CardTitle>
                      </Link>
                      <CardDescription className="mt-2">{dashboard.description}</CardDescription>
                      <div className="mt-2 text-xs text-slate-500">
                        Created {new Date(dashboard.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-400" />
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
