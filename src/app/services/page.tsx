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
  Wrench, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building,
  Thermometer
} from "lucide-react"

import { ServiceStatus } from "@/types"

interface ServiceRequest {
  id: string
  title: string
  description: string
  priority: string
  status: ServiceStatus
  requestedDate: string
  scheduledDate?: string
  completedDate?: string
  estimatedCost?: number
  finalCost?: number
  client: {
    id: string
    user: {
      name: string
      email: string
      phone?: string
    }
    companyName?: string
  }
  equipment?: {
    id: string
    name: string
    type: string
    brand?: string
    model?: string
    location?: string
  }
  assignments: Array<{
    id: string
    technician: {
      id: string
      user: {
        name: string
        email: string
        phone?: string
      }
    }
    assignedAt: string
    acceptedAt?: string
    startedAt?: string
    completedAt?: string
  }>
}

export default function ServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || service.status === statusFilter
    const matchesPriority = priorityFilter === "ALL" || service.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadgeVariant = (status: ServiceStatus) => {
    switch (status) {
      case "COMPLETED":
        return "default"
      case "IN_PROGRESS":
        return "secondary"
      case "PENDING":
        return "outline"
      case "ASSIGNED":
        return "default"
      case "CANCELLED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: ServiceStatus) => {
    switch (status) {
      case "COMPLETED":
        return "Concluído"
      case "IN_PROGRESS":
        return "Em Andamento"
      case "PENDING":
        return "Pendente"
      case "ASSIGNED":
        return "Atribuído"
      case "CANCELLED":
        return "Cancelado"
      default:
        return status
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "EMERGENCY":
        return "destructive"
      case "HIGH":
        return "destructive"
      case "MEDIUM":
        return "default"
      case "LOW":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "EMERGENCY":
        return "Emergência"
      case "HIGH":
        return "Alta"
      case "MEDIUM":
        return "Média"
      case "LOW":
        return "Baixa"
      default:
        return priority
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
              <p className="text-gray-600 mt-1">
                Gerencie todos os serviços de manutenção e instalação
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Serviços</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{services.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {services.filter(s => s.status === "PENDING").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {services.filter(s => s.status === "IN_PROGRESS").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {services.filter(s => s.status === "COMPLETED").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergências</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {services.filter(s => s.priority === "EMERGENCY").length}
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
                    placeholder="Buscar por título, cliente ou equipamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os status</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="ASSIGNED">Atribuído</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas as prioridades</SelectItem>
                    <SelectItem value="EMERGENCY">Emergência</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="LOW">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Services Table */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços</CardTitle>
              <CardDescription>
                Lista de todos os serviços cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Agendamento</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{service.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {service.description}
                            </div>
                            {service.equipment && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Thermometer className="h-3 w-3 mr-1" />
                                {service.equipment.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Building className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="font-medium text-sm">
                                {service.client.companyName || service.client.user.name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {service.client.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(service.status)}>
                            {getStatusLabel(service.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(service.priority)}>
                            {getPriorityLabel(service.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {service.scheduledDate ? (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                {new Date(service.scheduledDate).toLocaleDateString('pt-BR')}
                              </div>
                            ) : (
                              <span className="text-gray-500">Não agendado</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {service.assignments.length > 0 ? (
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1 text-gray-400" />
                                {service.assignments[0].technician.user.name}
                              </div>
                            ) : (
                              <span className="text-gray-500">Não atribuído</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedService(service)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Serviço</DialogTitle>
                                  <DialogDescription>
                                    Informações completas do serviço
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedService && (
                                  <div className="space-y-6">
                                    {/* Service Info */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-2">{selectedService.title}</h3>
                                      <p className="text-gray-600">{selectedService.description}</p>
                                      
                                      <div className="flex flex-wrap gap-2 mt-4">
                                        <Badge variant={getStatusBadgeVariant(selectedService.status)}>
                                          {getStatusLabel(selectedService.status)}
                                        </Badge>
                                        <Badge variant={getPriorityBadgeVariant(selectedService.priority)}>
                                          {getPriorityLabel(selectedService.priority)}
                                        </Badge>
                                      </div>
                                    </div>

                                    {/* Client Info */}
                                    <div>
                                      <h4 className="font-medium mb-2">Cliente</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="font-medium">
                                          {selectedService.client.companyName || selectedService.client.user.name}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                          <div className="flex items-center">
                                            <Mail className="h-3 w-3 mr-1" />
                                            {selectedService.client.user.email}
                                          </div>
                                          {selectedService.client.user.phone && (
                                            <div className="flex items-center mt-1">
                                              <Phone className="h-3 w-3 mr-1" />
                                              {selectedService.client.user.phone}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Equipment Info */}
                                    {selectedService.equipment && (
                                      <div>
                                        <h4 className="font-medium mb-2">Equipamento</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="font-medium">{selectedService.equipment.name}</div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            <div>Tipo: {selectedService.equipment.type}</div>
                                            {selectedService.equipment.brand && (
                                              <div>Marca: {selectedService.equipment.brand}</div>
                                            )}
                                            {selectedService.equipment.model && (
                                              <div>Modelo: {selectedService.equipment.model}</div>
                                            )}
                                            {selectedService.equipment.location && (
                                              <div className="flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {selectedService.equipment.location}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Assignment Info */}
                                    {selectedService.assignments.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2">Técnico Atribuído</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="font-medium">
                                            {selectedService.assignments[0].technician.user.name}
                                          </div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            <div className="flex items-center">
                                              <Mail className="h-3 w-3 mr-1" />
                                              {selectedService.assignments[0].technician.user.email}
                                            </div>
                                            {selectedService.assignments[0].technician.user.phone && (
                                              <div className="flex items-center mt-1">
                                                <Phone className="h-3 w-3 mr-1" />
                                                {selectedService.assignments[0].technician.user.phone}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-2">
                                            Atribuído em: {new Date(selectedService.assignments[0].assignedAt).toLocaleDateString('pt-BR')}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Dates and Costs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Datas</h4>
                                        <div className="space-y-1 text-sm">
                                          <div>
                                            <span className="font-medium">Solicitado:</span>{" "}
                                            {new Date(selectedService.requestedDate).toLocaleDateString('pt-BR')}
                                          </div>
                                          {selectedService.scheduledDate && (
                                            <div>
                                              <span className="font-medium">Agendado:</span>{" "}
                                              {new Date(selectedService.scheduledDate).toLocaleDateString('pt-BR')}
                                            </div>
                                          )}
                                          {selectedService.completedDate && (
                                            <div>
                                              <span className="font-medium">Concluído:</span>{" "}
                                              {new Date(selectedService.completedDate).toLocaleDateString('pt-BR')}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-medium mb-2">Custos</h4>
                                        <div className="space-y-1 text-sm">
                                          {selectedService.estimatedCost && (
                                            <div>
                                              <span className="font-medium">Estimado:</span>{" "}
                                              R$ {selectedService.estimatedCost.toFixed(2)}
                                            </div>
                                          )}
                                          {selectedService.finalCost && (
                                            <div>
                                              <span className="font-medium">Final:</span>{" "}
                                              R$ {selectedService.finalCost.toFixed(2)}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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