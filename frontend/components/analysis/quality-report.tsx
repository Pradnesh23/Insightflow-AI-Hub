"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle, Database, Columns, TrendingUp } from "lucide-react"

interface Column {
    name: string
    type: string
}

interface QualityReportProps {
    datasetId: string
    data: Record<string, unknown>[]
    columns: Column[]
    savedResult?: any
    onResultUpdate?: (result: any) => void
}

export function QualityReport({ datasetId, data, columns, savedResult, onResultUpdate }: QualityReportProps) {
    const [report, setReport] = useState<any>(savedResult || null)
    const [isLoading, setIsLoading] = useState(false)

    // Update local state when saved result changes
    useEffect(() => {
        if (savedResult) {
            setReport(savedResult)
        }
    }, [savedResult])

    const handleAnalyze = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/analysis/statistical", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    datasetId,
                    data,
                    columns: columns.map((c) => c.name),
                }),
            })
            const result = await response.json()
            console.log("Quality report result:", result)
            setReport(result.result_data)
            // Notify parent component
            if (onResultUpdate) {
                onResultUpdate(result.result_data)
            }
        } catch (error) {
            console.error("Quality report error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Parse quality report text
    const parseQualityMetrics = (reportText: string) => {
        const lines = reportText.split('\n').filter(line => line.trim())
        const metrics: any = {}

        lines.forEach(line => {
            if (line.includes('Total Rows:')) metrics.rows = line.split(':')[1].trim()
            if (line.includes('Total Columns:')) {
                const match = line.match(/(\d+) \((\d+) numeric, (\d+) text\)/)
                if (match) {
                    metrics.totalCols = match[1]
                    metrics.numericCols = match[2]
                    metrics.textCols = match[3]
                }
            }
            if (line.includes('Missing:')) metrics.missing = line.split(':')[1].trim()
            if (line.includes('Correlations:')) metrics.correlations = line.split(':')[1].trim()
            if (line.includes('Outliers:')) metrics.outliers = line.split(':')[1].trim()
        })

        return metrics
    }

    // Extract column list
    const extractColumns = (reportText: string) => {
        const lines = reportText.split('\n')
        const startIdx = lines.findIndex(l => l.includes('**All Columns:**'))
        if (startIdx === -1) return []

        return lines.slice(startIdx + 1)
            .filter(l => l.trim().startsWith('-'))
            .map(l => {
                const match = l.match(/- (.+) \((.+)\)/)
                return match ? { name: match[1], type: match[2] } : null
            })
            .filter(Boolean)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Data Quality Report</h2>
                    <p className="text-sm text-muted mt-1">Comprehensive analysis of your dataset</p>
                </div>
                <Button onClick={handleAnalyze} disabled={isLoading} className="bg-primary hover:bg-primary-dark gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Analyzing..." : "Generate Report"}
                </Button>
            </div>

            {report ? (
                <div className="space-y-6">
                    {/* Quality Score Hero */}
                    <Card className="glass-effect border-surface-light/20 bg-gradient-to-br from-primary/10 to-accent/10">
                        <CardContent className="pt-8 pb-8">
                            <div className="flex items-center justify-center gap-4">
                                {report.quality_score >= 80 ? (
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                ) : (
                                    <AlertCircle className="w-16 h-16 text-yellow-500" />
                                )}
                                <div>
                                    <div className="text-5xl font-bold gradient-text">{report.quality_score}/100</div>
                                    <div className="text-lg text-muted mt-1">Quality Score</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Metrics Grid */}
                    {report.quality_report && (() => {
                        const metrics = parseQualityMetrics(report.quality_report)
                        const allColumns = extractColumns(report.quality_report)

                        return (
                            <>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Card className="glass-effect border-surface-light/20">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                <Database className="w-8 h-8 text-accent" />
                                                <div>
                                                    <div className="text-2xl font-bold">{metrics.rows}</div>
                                                    <div className="text-sm text-muted">Total Rows</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="glass-effect border-surface-light/20">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                <Columns className="w-8 h-8 text-accent" />
                                                <div>
                                                    <div className="text-2xl font-bold">{metrics.totalCols}</div>
                                                    <div className="text-sm text-muted">{metrics.numericCols} numeric, {metrics.textCols} text</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="glass-effect border-surface-light/20">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                <TrendingUp className="w-8 h-8 text-accent" />
                                                <div>
                                                    <div className="text-2xl font-bold">{metrics.missing?.split('(')[1]?.replace(')', '') || 'N/A'}</div>
                                                    <div className="text-sm text-muted">Missing Data</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* All Columns List */}
                                {allColumns.length > 0 && (
                                    <Card className="glass-effect border-surface-light/20">
                                        <CardHeader>
                                            <CardTitle>All Columns ({allColumns.length})</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {allColumns.map((col: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-surface/30 border border-surface-light/10">
                                                        <div className={`w-2 h-2 rounded-full ${col.type === 'numeric' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{col.name}</div>
                                                            <div className="text-xs text-muted">{col.type}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )
                    })()}

                    {/* Statistics Overview */}
                    {report.statistics && Object.keys(report.statistics).length > 0 && (
                        <Card className="glass-effect border-surface-light/20">
                            <CardHeader>
                                <CardTitle>Numeric Columns Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(report.statistics).map(([col, stats]: [string, any]) => (
                                        <div key={col} className="p-4 rounded-lg bg-surface/50 border border-surface-light/20">
                                            <h3 className="font-semibold mb-3 text-accent text-lg">{col}</h3>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <div className="text-muted">Count</div>
                                                    <div className="font-semibold">{stats.count}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted">Mean</div>
                                                    <div className="font-semibold">{stats.mean}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted">Median</div>
                                                    <div className="font-semibold">{stats.median}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted">Std Dev</div>
                                                    <div className="font-semibold">{stats.std}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted">Min</div>
                                                    <div className="font-semibold">{stats.min}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted">Max</div>
                                                    <div className="font-semibold">{stats.max}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : (
                <Card className="glass-effect border-surface-light/20">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Database className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No Report Generated Yet</p>
                        <p className="text-sm text-muted max-w-md mx-auto">
                            Click "Generate Report" to see comprehensive data quality analysis including all columns, quality metrics, and statistical summaries
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
