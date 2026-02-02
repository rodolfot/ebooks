"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Search, X, ChevronLeft, ChevronRight, AlertTriangle, Activity, TrendingUp, Zap } from "lucide-react"
import { useLogPageView } from "@/hooks/useLogPageView"

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "TOGGLE", "LOGIN", "EXPORT", "VIEW"] as const
const RESOURCES = ["EBOOK", "ORDER", "COUPON", "REVIEW", "HOTMART_AD", "USER", "SYSTEM", "PAGE"] as const

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
  APPROVE: "bg-emerald-100 text-emerald-800",
  REJECT: "bg-orange-100 text-orange-800",
  TOGGLE: "bg-purple-100 text-purple-800",
  LOGIN: "bg-cyan-100 text-cyan-800",
  EXPORT: "bg-yellow-100 text-yellow-800",
  VIEW: "bg-teal-100 text-teal-800",
}

const resourceColors: Record<string, string> = {
  EBOOK: "border-blue-300 text-blue-700",
  ORDER: "border-green-300 text-green-700",
  COUPON: "border-purple-300 text-purple-700",
  REVIEW: "border-yellow-300 text-yellow-700",
  HOTMART_AD: "border-pink-300 text-pink-700",
  USER: "border-cyan-300 text-cyan-700",
  SYSTEM: "border-gray-300 text-gray-700",
  PAGE: "border-teal-300 text-teal-700",
}

interface Log {
  id: string
  userId: string | null
  action: string
  resource: string
  resourceId: string | null
  description: string | null
  ip: string | null
  userAgent: string | null
  method: string | null
  endpoint: string | null
  statusCode: number | null
  metadata: Record<string, unknown> | null
  changedFields: string[]
  errorMessage: string | null
  duration: number | null
  createdAt: string
  user: { name: string | null; email: string | null } | null
}

interface Stats {
  totalToday: number
  totalThisWeek: number
  errorCount: number
  topAction: { action: string; count: number } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminLogsPage() {
  useLogPageView("Logs")
  const [logs, setLogs] = useState<Log[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)

  // Filters
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [resourceFilter, setResourceFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [errorsOnly, setErrorsOnly] = useState(false)

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", "25")
    if (search) params.set("search", search)
    if (actionFilter) params.set("action", actionFilter)
    if (resourceFilter) params.set("resource", resourceFilter)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    if (errorsOnly) params.set("hasError", "true")

    try {
      const res = await fetch(`/api/admin/logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }, [search, actionFilter, resourceFilter, startDate, endDate, errorsOnly])

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/logs/stats")
    if (res.ok) setStats(await res.json())
  }, [])

  useEffect(() => {
    fetchLogs(1)
    fetchStats()
  }, [fetchLogs, fetchStats])

  function clearFilters() {
    setSearch("")
    setActionFilter("")
    setResourceFilter("")
    setStartDate("")
    setEndDate("")
    setErrorsOnly(false)
  }

  async function handleExport() {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (actionFilter) params.set("action", actionFilter)
    if (resourceFilter) params.set("resource", resourceFilter)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    if (errorsOnly) params.set("hasError", "true")

    const res = await fetch(`/api/admin/logs/export?${params}`)
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `logs-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const hasFilters = search || actionFilter || resourceFilter || startDate || endDate || errorsOnly

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Logs de Atividade</h1>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalThisWeek}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erros</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Acao</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topAction?.action || "-"}</div>
              {stats.topAction && <p className="text-xs text-muted-foreground">{stats.topAction.count}x</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar descricao, ID, usuario..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Acao" />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Recurso" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[150px]"
              placeholder="Data inicio"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[150px]"
              placeholder="Data fim"
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="errorsOnly"
                checked={errorsOnly}
                onCheckedChange={(c) => setErrorsOnly(c === true)}
              />
              <label htmlFor="errorsOnly" className="text-sm whitespace-nowrap">Somente erros</label>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" /> Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acao</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>Descricao</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum log encontrado.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.user?.name || log.user?.email || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={actionColors[log.action] || ""}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={resourceColors[log.resource] || ""}>
                      {log.resource}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[300px] truncate">
                    {log.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.total} registro{pagination.total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Pagina {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 text-sm">
              <DetailRow label="ID" value={selectedLog.id} mono />
              <DetailRow label="Data" value={new Date(selectedLog.createdAt).toLocaleString("pt-BR")} />
              <DetailRow label="Usuario" value={selectedLog.user?.name || selectedLog.user?.email || "-"} />
              <DetailRow label="Acao" value={selectedLog.action} />
              <DetailRow label="Recurso" value={selectedLog.resource} />
              <DetailRow label="ID Recurso" value={selectedLog.resourceId || "-"} mono />
              <DetailRow label="Descricao" value={selectedLog.description || "-"} />
              <DetailRow label="IP" value={selectedLog.ip || "-"} />
              <DetailRow label="Metodo" value={selectedLog.method || "-"} />
              <DetailRow label="Endpoint" value={selectedLog.endpoint || "-"} />
              <DetailRow label="Status" value={selectedLog.statusCode?.toString() || "-"} />
              <DetailRow label="Duracao" value={selectedLog.duration ? `${selectedLog.duration}ms` : "-"} />
              {selectedLog.changedFields.length > 0 && (
                <DetailRow label="Campos alterados" value={selectedLog.changedFields.join(", ")} />
              )}
              {selectedLog.errorMessage && (
                <div>
                  <span className="font-medium text-red-600">Erro:</span>
                  <p className="mt-1 rounded bg-red-50 p-2 text-red-800 text-xs whitespace-pre-wrap">
                    {selectedLog.errorMessage}
                  </p>
                </div>
              )}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <span className="font-medium">Metadata:</span>
                  <pre className="mt-1 rounded bg-muted p-2 text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.userAgent && (
                <div>
                  <span className="font-medium">User Agent:</span>
                  <p className="mt-1 text-xs text-muted-foreground break-all">{selectedLog.userAgent}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="font-medium min-w-[120px] text-muted-foreground">{label}:</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  )
}
