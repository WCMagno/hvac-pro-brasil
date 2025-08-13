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
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Banknote,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building,
  FileText,
  Edit
} from "lucide-react"
import { PaymentStatus } from "@prisma/client"

interface FinancialTransaction {
  id: string
  type: string
  description: string
  amount: number
  status: PaymentStatus
  dueDate?: string
  paidDate?: string
  paymentMethod?: string
  notes?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  service?: {
    id: string
    title: string
    client: {
      user: {
        name: string
      }
    }
  }
}

export default function FinancialPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/financial")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.service?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.service?.client.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === "ALL" || transaction.type === typeFilter
    const matchesStatus = statusFilter === "ALL" || transaction.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "default"
      case "PENDING":
        return "outline"
      case "OVERDUE":
        return "destructive"
      case "CANCELLED":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "Pago"
      case "PENDING":
        return "Pendente"
      case "OVERDUE":
        return "Vencido"
      case "CANCELLED":
        return "Cancelado"
      default:
        return status
    }
  }

  // Calculate financial summary
  const totalIncome = transactions
    .filter(t => t.type === "INCOME" && t.status === "PAID")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === "EXPENSE" && t.status === "PAID")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingIncome = transactions
    .filter(t => t.type === "INCOME" && t.status === "PENDING")
    .reduce((sum, t) => sum + t.amount, 0)

  const overdueIncome = transactions
    .filter(t => t.type === "INCOME" && t.status === "OVERDUE")
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

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
              <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
              <p className="text-gray-600 mt-1">
                Gerencie receitas, despesas e transações financeiras
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">A Receber</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  R$ {pendingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {overdueIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    placeholder="Buscar por descrição, usuário ou serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os tipos</SelectItem>
                    <SelectItem value="INCOME">Receitas</SelectItem>
                    <SelectItem value="EXPENSE">Despesas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os status</SelectItem>
                    <SelectItem value="PAID">Pago</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="OVERDUE">Vencido</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Financeiras</CardTitle>
              <CardDescription>
                Histórico de todas as transações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.service && (
                              <div className="text-sm text-gray-500">
                                Serviço: {transaction.service.title}
                              </div>
                            )}
                            {transaction.notes && (
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {transaction.notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "INCOME" ? "default" : "secondary"}>
                            {transaction.type === "INCOME" ? "Receita" : "Despesa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${
                            transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                          }`}>
                            {transaction.type === "INCOME" ? "+" : "-"}
                            R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>
                            {getStatusLabel(transaction.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {transaction.dueDate ? (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                              </div>
                            ) : (
                              <span className="text-gray-500">Não definido</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1 text-gray-400" />
                              {transaction.user.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Transação</DialogTitle>
                                  <DialogDescription>
                                    Informações completas da transação financeira
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedTransaction && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="text-lg font-semibold">{selectedTransaction.description}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Badge variant={selectedTransaction.type === "INCOME" ? "default" : "secondary"}>
                                            {selectedTransaction.type === "INCOME" ? "Receita" : "Despesa"}
                                          </Badge>
                                          <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                                            {getStatusLabel(selectedTransaction.status)}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className={`text-2xl font-bold ${
                                        selectedTransaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                                      }`}>
                                        {selectedTransaction.type === "INCOME" ? "+" : "-"}
                                        R$ {selectedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Informações Básicas</h4>
                                        <div className="space-y-1 text-sm">
                                          <div><span className="font-medium">Usuário:</span> {selectedTransaction.user.name}</div>
                                          <div><span className="font-medium">Email:</span> {selectedTransaction.user.email}</div>
                                          <div><span className="font-medium">Criado em:</span> {new Date(selectedTransaction.createdAt).toLocaleDateString('pt-BR')}</div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-medium mb-2">Informações de Pagamento</h4>
                                        <div className="space-y-1 text-sm">
                                          {selectedTransaction.dueDate && (
                                            <div><span className="font-medium">Vencimento:</span> {new Date(selectedTransaction.dueDate).toLocaleDateString('pt-BR')}</div>
                                          )}
                                          {selectedTransaction.paidDate && (
                                            <div><span className="font-medium">Pago em:</span> {new Date(selectedTransaction.paidDate).toLocaleDateString('pt-BR')}</div>
                                          )}
                                          {selectedTransaction.paymentMethod && (
                                            <div><span className="font-medium">Método:</span> {selectedTransaction.paymentMethod}</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {selectedTransaction.service && (
                                      <div>
                                        <h4 className="font-medium mb-2">Serviço Relacionado</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="font-medium">{selectedTransaction.service.title}</div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            Cliente: {selectedTransaction.service.client.user.name}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {selectedTransaction.notes && (
                                      <div>
                                        <h4 className="font-medium mb-2">Observações</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                          {selectedTransaction.notes}
                                        </div>
                                      </div>
                                    )}
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