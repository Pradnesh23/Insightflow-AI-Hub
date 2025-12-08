"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, LogOut, Plus, Upload, Calendar, Lightbulb, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DatasetCard } from "./dataset-card"
import { FileUploadDialog } from "./file-upload-dialog"

interface Dataset {
  id: string
  name: string
  created_at: string
  row_count: number
  column_count: number
}

export function DashboardClient({ initialDatasets, userId }: { initialDatasets: Dataset[]; userId: string }) {
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleUploadSuccess = (newDataset: Dataset) => {
    setDatasets([newDataset, ...datasets])
    setIsUploadOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-background dark:from-background dark:via-slate-900/30 dark:to-background">
      {/* Header */}
      <header className="glass-effect border-b border-primary/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold gradient-text">InsightFlow</span>
          </div>
          <div className="flex gap-2">
            <Link href="/memories">
              <Button variant="ghost" className="gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Memories</span>
              </Button>
            </Link>
            <Link href="/meeting-agent">
              <Button variant="ghost" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Meetings</span>
              </Button>
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
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Welcome to InsightFlow</h1>
          <p className="text-muted-foreground">Upload your data and let AI uncover insights</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="glass-effect border-primary/10 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Data Analysis</h3>
                  <p className="text-sm text-muted-foreground">Upload and analyze your datasets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/meeting-agent">
            <Card className="glass-effect border-primary/10 hover:border-primary/30 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Meeting Agent</h3>
                    <p className="text-sm text-muted-foreground">Prepare meetings with AI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/memories">
            <Card className="glass-effect border-primary/10 hover:border-primary/30 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Memory Explorer</h3>
                    <p className="text-sm text-muted-foreground">Browse saved insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          <FileUploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} onSuccess={handleUploadSuccess} />
          <Button onClick={() => setIsUploadOpen(true)} size="lg" className="bg-primary hover:bg-primary/90 gap-2">
            <Upload className="w-4 h-4" />
            Upload Dataset
          </Button>
        </div>

        {/* Datasets Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Datasets</h2>
          {datasets.length === 0 ? (
            <Card className="glass-effect border-primary/10">
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground mb-4">No datasets yet. Upload your first dataset to get started!</p>
                <Button onClick={() => setIsUploadOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" />
                  Upload Dataset
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
