"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

interface Dataset {
  id: string
  name: string
  created_at: string
  row_count: number
  column_count: number
}

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await supabase.from("datasets").delete().eq("id", dataset.id)
      window.location.reload()
    } catch (error) {
      console.error("Delete error:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="glass-effect border-surface-light/20 card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          {dataset.name}
        </CardTitle>
        <CardDescription>{formatDate(dataset.created_at)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="text-sm">
            <span className="text-muted">Rows:</span> <span className="font-semibold">{dataset.row_count}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted">Columns:</span> <span className="font-semibold">{dataset.column_count}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/analysis/${dataset.id}`} className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary-dark">Analyze</Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-error hover:bg-error/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
