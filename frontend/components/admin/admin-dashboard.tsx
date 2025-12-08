"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, LogOut, Users, Database, BarChart3, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Stats {
  totalUsers: number
  totalDatasets: number
  totalAnalyses: number
  totalChats: number
}

export function AdminDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDatasets: 0,
    totalAnalyses: 0,
    totalChats: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, datasets, analyses, chats] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact" }),
          supabase.from("datasets").select("id", { count: "exact" }),
          supabase.from("analysis_results").select("id", { count: "exact" }),
          supabase.from("chat_history").select("id", { count: "exact" }),
        ])

        setStats({
          totalUsers: users.count || 0,
          totalDatasets: datasets.count || 0,
          totalAnalyses: analyses.count || 0,
          totalChats: chats.count || 0,
        })
      } catch (error) {
        console.error("Stats error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-background dark:from-background dark:via-slate-900/30 dark:to-background">
      {/* Header */}
      <header className="glass-effect border-b border-primary/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold gradient-text">InsightFlow Admin</span>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform statistics and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="glass-effect border-primary/10 card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-5 h-5 text-primary" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "-" : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Active users</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/10 card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Database className="w-5 h-5 text-primary" />
                Total Datasets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "-" : stats.totalDatasets}</div>
              <p className="text-xs text-muted-foreground mt-1">Uploaded files</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/10 card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="w-5 h-5 text-primary" />
                Total Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "-" : stats.totalAnalyses}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed analyses</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/10 card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="w-5 h-5 text-primary" />
                Total Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "-" : stats.totalChats}</div>
              <p className="text-xs text-muted-foreground mt-1">AI conversations</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass-effect border-primary/10">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
                <span className="text-sm">Average Analyses per Dataset</span>
                <span className="font-semibold">
                  {stats.totalDatasets > 0 ? (stats.totalAnalyses / stats.totalDatasets).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
                <span className="text-sm">Average Chats per User</span>
                <span className="font-semibold">
                  {stats.totalUsers > 0 ? (stats.totalChats / stats.totalUsers).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg">
                <span className="text-sm">Platform Engagement</span>
                <span className="font-semibold">
                  {stats.totalUsers > 0 ? ((stats.totalDatasets / stats.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
