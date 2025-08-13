"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building,
  Wrench,
  Mail,
  Phone,
  Calendar
} from "lucide-react"
import { UserRole } from "@prisma/client"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  avatar?: string
  active: boolean
  createdAt: string
  clientProfile?: {
    id: string
    companyName: string
    document?: string
  }
  technicianProfile?: {
    id: string
    licenseNumber: string
    specialty?: string
    experience?: number
    available: boolean
  }
}

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.clientProfile?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "TECHNICIAN":
        return "default"
      case "CLIENT":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "Administrador"
      case "TECHNICIAN":
        return "Técnico"
      case "CLIENT":
        return "Cliente"
      default:
        return role
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={["ADMIN"]}>
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
              <p className="text-gray-600 mt-1">
                Gerencie clientes, técnicos e administradores do sistema
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === "CLIENT").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Técnicos</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === "TECHNICIAN").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.active).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, email ou empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "ALL")}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os tipos</SelectItem>
                    <SelectItem value="CLIENT">Clientes</SelectItem>
                    <SelectItem value="TECHNICIAN">Técnicos</SelectItem>
                    <SelectItem value="ADMIN">Administradores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>
                Lista de todos os usuários cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Informações</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                {user.phone}
                              </div>
                            )}
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.clientProfile && (
                              <div className="flex items-center">
                                <Building className="h-3 w-3 mr-1 text-gray-400" />
                                {user.clientProfile.companyName}
                              </div>
                            )}
                            {user.technicianProfile && (
                              <div className="flex items-center">
                                <Wrench className="h-3 w-3 mr-1 text-gray-400" />
                                {user.technicianProfile.specialty || "Técnico"}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.active ? "default" : "secondary"}>
                            {user.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Usuário</DialogTitle>
                                  <DialogDescription>
                                    Informações completas do usuário
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                      <Avatar className="h-16 w-16">
                                        <AvatarImage src={selectedUser.avatar} />
                                        <AvatarFallback>
                                          {selectedUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                        <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                                          {getRoleLabel(selectedUser.role)}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Informações Pessoais</h4>
                                        <div className="space-y-1 text-sm">
                                          <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                                          <div><span className="font-medium">Telefone:</span> {selectedUser.phone || "Não informado"}</div>
                                          <div><span className="font-medium">Status:</span> {selectedUser.active ? "Ativo" : "Inativo"}</div>
                                          <div><span className="font-medium">Cadastro:</span> {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</div>
                                        </div>
                                      </div>
                                      
                                      {selectedUser.clientProfile && (
                                        <div>
                                          <h4 className="font-medium mb-2">Informações da Empresa</h4>
                                          <div className="space-y-1 text-sm">
                                            <div><span className="font-medium">Empresa:</span> {selectedUser.clientProfile.companyName}</div>
                                            <div><span className="font-medium">Documento:</span> {selectedUser.clientProfile.document || "Não informado"}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {selectedUser.technicianProfile && (
                                        <div>
                                          <h4 className="font-medium mb-2">Informações do Técnico</h4>
                                          <div className="space-y-1 text-sm">
                                            <div><span className="font-medium">Licença:</span> {selectedUser.technicianProfile.licenseNumber}</div>
                                            <div><span className="font-medium">Especialidade:</span> {selectedUser.technicianProfile.specialty || "Não informada"}</div>
                                            <div><span className="font-medium">Experiência:</span> {selectedUser.technicianProfile.experience || 0} anos</div>
                                            <div><span className="font-medium">Disponível:</span> {selectedUser.technicianProfile.available ? "Sim" : "Não"}</div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}