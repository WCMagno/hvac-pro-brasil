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
  Receipt, 
  Plus, 
  Search, 
  Filter,
  Download,
  Share2,
  DollarSign,
  Calendar,
  CreditCard,
  Banknote,
  FileText,
  User,
  Building,
  FileDown,
  MessageCircle,
  CheckCircle,
  Clock
} from "lucide-react"

interface ReceiptData {
  id: string
  receiptNumber: string
  issuedAt: string
  amount: number
  description: string
  paymentMethod?: string
  status: string
  pdfUrl?: string
  service: {
    id: string
    title: string
    client: {
      user: {
        name: string
        email: string
        phone?: string
      }
      companyName?: string
    }
  }
  user: {
    id: string
    name: string
    email: string
  }
}

export default function ReceiptsPage() {
  const { user } = useAuth()
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      const response = await fetch("/api/receipts")
      if (response.ok) {
        const data = await response.json()
        setReceipts(data)
      }
    } catch (error) {
      console.error("Error fetching receipts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.service.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.service.client.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || receipt.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ISSUED":
        return "default"
      case "PAID":
        return "secondary"
      case "CANCELLED":
        return "destructive"
      case "PENDING":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ISSUED":
        return "Emitido"
      case "PAID":
        return "Pago"
      case "CANCELLED":
        return "Cancelado"
      case "PENDING":
        return "Pendente"
      default:
        return status
    }
  }

  const generatePDF = async (receiptId: string) => {
    try {
      const response = await fetch(`/api/receipts/${receiptId}/generate-pdf`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recibo-${receiptId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const shareViaWhatsApp = (receipt: ReceiptData) => {
    const message = `Recibo de Pagamento - ${receipt.receiptNumber}\n\n` +
      `Descrição: ${receipt.description}\n` +
      `Valor: R$ ${receipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `Data de Emissão: ${new Date(receipt.issuedAt).toLocaleDateString('pt-BR')}\n` +
      `Forma de Pagamento: ${receipt.paymentMethod || 'Não informado'}\n` +
      `Status: ${getStatusLabel(receipt.status)}\n\n` +
      `Serviço: ${receipt.service.title}\n` +
      `Cliente: ${receipt.service.client.companyName || receipt.service.client.user.name}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  // Calculate receipt statistics
  const totalReceipts = receipts.length
  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0)
  const issuedReceipts = receipts.filter(r => r.status === "ISSUED").length
  const paidReceipts = receipts.filter(r => r.status === "PAID").length
  const pendingReceipts = receipts.filter(r => r.status === "PENDING").length

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
              <h1 className="text-3xl font-bold text-gray-900">Recibos</h1>
              <p className="text-gray-600 mt-1">
                Gerencie recibos de pagamento com exportação PDF e compartilhamento
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Recibo
              </Button>
            </div>
          </div>

          {/* Receipt Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recibos</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReceipts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emitidos</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{issuedReceipts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingReceipts}</div>
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
                    placeholder="Buscar por número, descrição ou cliente..."
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
                    <SelectItem value="ISSUED">Emitido</SelectItem>
                    <SelectItem value="PAID">Pago</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Receipts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recibos</CardTitle>
              <CardDescription>
                Histórico de recibos de pagamento emitidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recibo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Emissão</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{receipt.receiptNumber}</div>
                            <div className="text-sm text-gray-500">
                              {receipt.paymentMethod && (
                                <div className="flex items-center">
                                  <CreditCard className="h-3 w-3 mr-1 text-gray-400" />
                                  {receipt.paymentMethod}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{receipt.description}</div>
                            <div className="text-sm text-gray-500">
                              Serviço: {receipt.service.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            R$ {receipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(receipt.status)}>
                            {getStatusLabel(receipt.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              {new Date(receipt.issuedAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Building className="h-3 w-3 mr-1 text-gray-400" />
                              {receipt.service.client.companyName || receipt.service.client.user.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Recibo - {selectedReceipt?.receiptNumber}</DialogTitle>
                                  <DialogDescription>
                                    Detalhes do recibo de pagamento
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedReceipt && (
                                  <div className="space-y-6">
                                    {/* Header Information */}
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="text-xl font-semibold">Recibo de Pagamento</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Badge variant={getStatusBadgeVariant(selectedReceipt.status)}>
                                            {getStatusLabel(selectedReceipt.status)}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                          R$ {selectedReceipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {selectedReceipt.receiptNumber}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Informações do Recibo</h4>
                                        <div className="space-y-1 text-sm bg-gray-50 p-4 rounded-lg">
                                          <div><span className="font-medium">Número:</span> {selectedReceipt.receiptNumber}</div>
                                          <div><span className="font-medium">Descrição:</span> {selectedReceipt.description}</div>
                                          <div><span className="font-medium">Emitido em:</span> {new Date(selectedReceipt.issuedAt).toLocaleDateString('pt-BR')}</div>
                                          {selectedReceipt.paymentMethod && (
                                            <div><span className="font-medium">Forma de Pagamento:</span> {selectedReceipt.paymentMethod}</div>
                                          )}
                                        </div>
                                      </div>

                                      <div>
                                        <h4 className="font-medium mb-2">Emitido por</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="font-medium">{selectedReceipt.user.name}</div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            <div>{selectedReceipt.user.email}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Service Information */}
                                    <div>
                                      <h4 className="font-medium mb-2">Serviço Relacionado</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="font-medium">{selectedReceipt.service.title}</div>
                                      </div>
                                    </div>

                                    {/* Client Information */}
                                    <div>
                                      <h4 className="font-medium mb-2">Cliente</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="font-medium">
                                          {selectedReceipt.service.client.companyName || selectedReceipt.service.client.user.name}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                          <div>{selectedReceipt.service.client.user.email}</div>
                                          {selectedReceipt.service.client.user.phone && (
                                            <div>{selectedReceipt.service.client.user.phone}</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4 border-t">
                                      <Button 
                                        onClick={() => generatePDF(selectedReceipt.id)}
                                        className="flex-1"
                                      >
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Baixar PDF
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        onClick={() => shareViaWhatsApp(selectedReceipt)}
                                        className="flex-1"
                                      >
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Compartilhar WhatsApp
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => generatePDF(receipt.id)}
                              title="Baixar PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => shareViaWhatsApp(receipt)}
                              title="Compartilhar WhatsApp"
                            >
                              <Share2 className="h-4 w-4" />
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