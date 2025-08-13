// FileText icon imported - fixed import error
"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { 
  Thermometer, 
  Wrench, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  FileText
} from "lucide-react"

export default function Home() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo de volta, {user?.name}! 
                {user?.role === "ADMIN" && " (Administrador)"}
                {user?.role === "TECHNICIAN" && " (Técnico)"}
                {user?.role === "CLIENT" && " (Cliente)"}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Wrench className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 45.231</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% desde o mês passado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  +12 novos este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PMOC Vencendo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Próximos 30 dias
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Services */}
            <Card>
              <CardHeader>
                <CardTitle>Serviços Recentes</CardTitle>
                <CardDescription>
                  Últimos serviços solicitados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      title: "Manutenção Preventiva - Split 18000 BTU",
                      client: "João Silva",
                      status: "IN_PROGRESS",
                      priority: "HIGH",
                      date: "2024-01-15"
                    },
                    {
                      id: 2,
                      title: "Instalação Ar Condicionado Central",
                      client: "Maria Santos",
                      status: "PENDING",
                      priority: "MEDIUM",
                      date: "2024-01-14"
                    },
                    {
                      id: 3,
                      title: "Reparo de Vazamento de Gás",
                      client: "Pedro Oliveira",
                      status: "COMPLETED",
                      priority: "EMERGENCY",
                      date: "2024-01-13"
                    },
                    {
                      id: 4,
                      title: "Limpeza de Filtros",
                      client: "Ana Costa",
                      status: "ASSIGNED",
                      priority: "LOW",
                      date: "2024-01-12"
                    }
                  ].map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{service.title}</h4>
                        <p className="text-xs text-gray-500">{service.client}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={
                            service.status === "COMPLETED" ? "default" :
                            service.status === "IN_PROGRESS" ? "secondary" :
                            service.status === "PENDING" ? "outline" :
                            "destructive"
                          }>
                            {service.status === "COMPLETED" ? "Concluído" :
                             service.status === "IN_PROGRESS" ? "Em Andamento" :
                             service.status === "PENDING" ? "Pendente" :
                             service.status === "ASSIGNED" ? "Atribuído" : "Cancelado"}
                          </Badge>
                          <Badge variant="outline">
                            {service.priority === "HIGH" ? "Alta" :
                             service.priority === "MEDIUM" ? "Média" :
                             service.priority === "LOW" ? "Baixa" : "Emergência"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {service.date}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* PMOC Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas PMOC</CardTitle>
                <CardDescription>
                  Inspeções próximas do vencimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      equipment: "Split 12000 BTU - Sala Comercial",
                      client: "Empresa ABC Ltda",
                      nextInspection: "2024-01-20",
                      daysLeft: 5
                    },
                    {
                      id: 2,
                      equipment: "Central de Água Gelada",
                      client: "Shopping Center",
                      nextInspection: "2024-01-25",
                      daysLeft: 10
                    },
                    {
                      id: 3,
                      equipment: "Split 18000 BTU - Escritório",
                      client: "Consultoria XYZ",
                      nextInspection: "2024-02-01",
                      daysLeft: 17
                    },
                    {
                      id: 4,
                      equipment: "Cassete 36000 BTU",
                      client: "Restaurante Sabor & Cia",
                      nextInspection: "2024-02-10",
                      daysLeft: 26
                    }
                  ].map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{alert.equipment}</h4>
                        <p className="text-xs text-gray-500">{alert.client}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Próxima inspeção: {alert.nextInspection}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.daysLeft <= 7 ? "destructive" : "outline"}>
                          {alert.daysLeft} dias
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acessar rapidamente as funções mais utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Wrench className="h-6 w-6 mb-2" />
                  Novo Serviço
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Novo Cliente
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Wrench className="h-6 w-6 mb-2" />
                  Gerar PMOC
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <DollarSign className="h-6 w-6 mb-2" />
                  Novo Recibo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}