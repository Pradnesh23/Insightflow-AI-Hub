"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, AlertCircle } from "lucide-react"

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (dataset: any) => void
}

export function FileUploadDialog({ open, onOpenChange, onSuccess }: FileUploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      setError("Please upload a CSV or Excel file")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorMessage = responseData.details || responseData.error || "Upload failed"
        throw new Error(errorMessage)
      }

      if (!responseData.dataset) {
        throw new Error("Invalid response from server")
      }

      console.log("[v0] Upload successful:", responseData.dataset)
      onSuccess(responseData.dataset)
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      console.error("[v0] Upload error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-primary/10">
        <DialogHeader>
          <DialogTitle>Upload Dataset</DialogTitle>
          <DialogDescription>Upload a CSV or Excel file to analyze</DialogDescription>
        </DialogHeader>

        <div
          onDragOver={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-primary/20"
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="font-semibold mb-2">Drag and drop your file here</p>
          <p className="text-sm text-muted-foreground mb-4">or</p>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Select File"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
