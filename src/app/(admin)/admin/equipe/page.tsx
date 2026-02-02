"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, UserCog } from "lucide-react"
import { useLogPageView } from "@/hooks/useLogPageView"

const ROLE_LABELS: Record<string, string> = {
  INTERN: "Estagiario",
  ANALYST: "Analista",
  SUPPORT: "Suporte",
  LOGISTICS: "Logistica",
  MARKETING: "Marketing",
  FINANCE: "Financeiro",
  MODERATOR: "Moderador",
  EDITOR: "Editor",
  MANAGER: "Gerente",
  ADMIN: "Administrador",
  SUPER_ADMIN: "Super Admin",
}

const ROLE_COLORS: Record<string, string> = {
  INTERN: "bg-gray-100 text-gray-800",
  ANALYST: "bg-blue-100 text-blue-800",
  SUPPORT: "bg-cyan-100 text-cyan-800",
  LOGISTICS: "bg-orange-100 text-orange-800",
  MARKETING: "bg-pink-100 text-pink-800",
  FINANCE: "bg-emerald-100 text-emerald-800",
  MODERATOR: "bg-violet-100 text-violet-800",
  EDITOR: "bg-indigo-100 text-indigo-800",
  MANAGER: "bg-amber-100 text-amber-800",
  ADMIN: "bg-red-100 text-red-800",
  SUPER_ADMIN: "bg-red-200 text-red-900",
}

const STAFF_ROLES = Object.keys(ROLE_LABELS)

interface Employee {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  employeeCode: string | null
  hireDate: string | null
  terminationDate: string | null
  level: number | null
  managerId: string | null
  manager: { name: string | null } | null
  createdAt: string
}

export default function AdminEquipePage() {
  useLogPageView("Equipe")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("EDITOR")
  const [employeeCode, setEmployeeCode] = useState("")
  const [hireDate, setHireDate] = useState("")

  // Edit state
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState("")
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editCode, setEditCode] = useState("")

  const refreshEmployees = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/employees")
      .then((r) => (r.ok ? r.json() : []))
      .then(setEmployees)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refreshEmployees()
  }, [refreshEmployees])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, employeeCode: employeeCode || undefined, hireDate: hireDate || undefined }),
      })
      if (res.ok) {
        toast.success("Funcionario criado!")
        setShowForm(false)
        setName("")
        setEmail("")
        setPassword("")
        setRole("EDITOR")
        setEmployeeCode("")
        setHireDate("")
        refreshEmployees()
      } else {
        const data = await res.json()
        toast.error(data.error || "Erro ao criar funcionario")
      }
    } catch {
      toast.error("Erro ao criar funcionario")
    } finally {
      setSaving(false)
    }
  }

  function openEdit(emp: Employee) {
    setEditId(emp.id)
    setEditName(emp.name || "")
    setEditRole(emp.role)
    setEditCode(emp.employeeCode || "")
    setEditOpen(true)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/employees/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, role: editRole, employeeCode: editCode }),
      })
      if (res.ok) {
        toast.success("Funcionario atualizado!")
        setEditOpen(false)
        refreshEmployees()
      } else {
        const data = await res.json()
        toast.error(data.error || "Erro ao atualizar")
      }
    } catch {
      toast.error("Erro ao atualizar")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id: string, name: string | null) {
    if (!confirm(`Remover ${name || "funcionario"} da equipe? O usuario sera rebaixado para cliente.`)) return
    try {
      const res = await fetch(`/api/admin/employees/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Funcionario removido da equipe")
        refreshEmployees()
      } else {
        const data = await res.json()
        toast.error(data.error || "Erro ao remover")
      }
    } catch {
      toast.error("Erro ao remover")
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="h-8 w-8 text-primary" />
          <h1 className="font-serif text-3xl font-bold">Equipe</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Funcionario
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Funcionario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Codigo do Funcionario</Label>
                  <Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="EMP-001" />
                </div>
                <div className="space-y-2">
                  <Label>Data de Admissao</Label>
                  <Input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Criar Funcionario
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Codigo</TableHead>
                <TableHead>Admissao</TableHead>
                <TableHead>Gestor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum funcionario cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name || "-"}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={ROLE_COLORS[emp.role] || ""}>
                        {ROLE_LABELS[emp.role] || emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{emp.employeeCode || "-"}</TableCell>
                    <TableCell>{formatDate(emp.hireDate)}</TableCell>
                    <TableCell>{emp.manager?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={emp.status === "ACTIVE" ? "default" : "secondary"}>
                        {emp.status === "ACTIVE" ? "Ativo" : emp.status === "SUSPENDED" ? "Suspenso" : "Banido"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(emp)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRemove(emp.id, emp.name)} title="Remover da equipe">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Funcionario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Codigo do Funcionario</Label>
              <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} placeholder="EMP-001" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
