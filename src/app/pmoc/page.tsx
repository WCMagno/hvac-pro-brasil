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
import ImageUpload, { UploadedImage } from "@/components/ui/image-upload"
import { useAuth } from "@/hooks/use-auth"
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Thermometer,
  User,
  Building,
  FileDown,
  MessageCircle,
  Image as ImageIcon
} from "lucide-react"

interface PMOCReport {
  id: string
  reportNumber: string
  generatedAt: string
  inspectionDate: string
  nextInspection: string
  findings: string
  recommendations: string
  complianceStatus: string
  temperature?: number
  pressure?: number
  gasLevel?: number
  electricalReadings?: string
  pdfUrl?: string
  images?: {
    id: string
    url: string
    filename: string
    description?: string
    uploadDate: string
  }[]
  equipment: {
    id: string
    name: string
    type: string
    brand?: string
    model?: string
    serialNumber?: string
    location?: string
    client: {
      id: string
      companyName?: string
      user: {
        name: string
        email: string
        phone?: string
      }
    }
  }
  technician: {
    id: string
    user: {
      name: string
      email: string
      phone?: string
    }
  }
  service?: {
    id: string
    title: string
  }
}

export default function PMOCPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<PMOCReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedReport, setSelectedReport] = useState<PMOCReport | null>(null)
  const [reportImages, setReportImages] = useState<UploadedImage[]>([])
  const [isEditingImages, setIsEditingImages] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/pmoc")
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error("Error fetching PMOC reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImagesChange = (images: UploadedImage[]) => {
    setReportImages(images)
  }

  const handleSaveImages = async () => {
    if (!selectedReport) return
    
    try {
      const response = await fetch(`/api/pmoc/${selectedReport.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: reportImages }),
      })

      if (response.ok) {
        // Atualizar o relatório selecionado com as novas imagens
        const updatedReport = {
          ...selectedReport,
          images: reportImages.map(img => ({
            id: img.id,
            url: img.url,
            filename: img.filename,
            uploadDate: img.uploadDate.toISOString()
          }))
        }
        setSelectedReport(updatedReport)
        setIsEditingImages(false)
        
        // Atualizar a lista de relatórios
        setReports(prev => prev.map(r => 
          r.id === selectedReport.id ? updatedReport : r
        ))
      }
    } catch (error) {
      console.error("Error saving images:", error)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.equipment.client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.equipment.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.findings.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || report.complianceStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return "default"
      case "NON_COMPLIANT":
        return "destructive"
      case "PARTIAL":
        return "secondary"
      case "PENDING":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return "Conforme"
      case "NON_COMPLIANT":
        return "Não Conforme"
      case "PARTIAL":
        return "Parcialmente Conforme"
      case "PENDING":
        return "Pendente"
      default:
        return status
    }
  }

  const getDaysUntilNextInspection = (nextInspection: string) => {
    const nextDate = new Date(nextInspection)
    const today = new Date()
    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const generatePDF = async (reportId: string) => {
    try {
      const response = await fetch(`/api/pmoc/${reportId}/generate-pdf`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pmoc-${reportId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const shareViaWhatsApp = (report: PMOCReport) => {
    const message = `Relatório PMOC - ${report.reportNumber}\n\n` +
      `Equipamento: ${report.equipment.name}\n` +
      `Cliente: ${report.equipment.client.companyName || report.equipment.client.user.name}\n` +
      `Data da Inspeção: ${new Date(report.inspectionDate).toLocaleDateString('pt-BR')}\n` +
      `Próxima Inspeção: ${new Date(report.nextInspection).toLocaleDateString('pt-BR')}\n` +
      `Status: ${getStatusLabel(report.complianceStatus)}\n\n` +
      `Principais Constatações:\n${report.findings}\n\n` +
      `Recomendações:\n${report.recommendations}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  // Calculate PMOC statistics
  const totalReports = reports.length
  const compliantReports = reports.filter(r => r.complianceStatus === "COMPLIANT").length
  const nonCompliantReports = reports.filter(r => r.complianceStatus === "NON_COMPLIANT").length
  const pendingInspections = reports.filter(r => {
    const daysUntil = getDaysUntilNextInspection(r.nextInspection)
    return daysUntil <= 30 && daysUntil > 0
  }).length
  const overdueInspections = reports.filter(r => {
    const daysUntil = getDaysUntilNextInspection(r.nextInspection)
    return daysUntil < 0
  }).length

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
              <h1 className="text-3xl font-bold text-gray-900">PMOC</h1>
              <p className="text-gray-600 mt-1">
                Gestão de Relatórios de Manutenção Preventiva conforme Lei nº 13.589/2018
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Relatório PMOC
              </Button>
            </div>
          </div>

          {/* PMOC Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Relatórios</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conformes</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{compliantReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Não Conformes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{nonCompliantReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingInspections}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueInspections}</div>
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
                    placeholder="Buscar por número, equipamento ou cliente..."
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
                    <SelectItem value="COMPLIANT">Conforme</SelectItem>
                    <SelectItem value="NON_COMPLIANT">Não Conforme</SelectItem>
                    <SelectItem value="PARTIAL">Parcialmente Conforme</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* PMOC Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios PMOC</CardTitle>
              <CardDescription>
                Histórico de relatórios de manutenção preventiva obrigatória
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Relatório</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Próxima Inspeção</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => {
                      const daysUntil = getDaysUntilNextInspection(report.nextInspection)
                      const isOverdue = daysUntil < 0
                      const isPending = daysUntil <= 30 && daysUntil > 0

                      return (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{report.reportNumber}</div>
                              <div className="text-sm text-gray-500">
                                Inspeção: {new Date(report.inspectionDate).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Thermometer className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="text-sm">{report.equipment.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {report.equipment.client.companyName || report.equipment.client.user.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(report.complianceStatus)}>
                              {getStatusLabel(report.complianceStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                {new Date(report.nextInspection).toLocaleDateString('pt-BR')}
                              </div>
                              <Badge 
                                variant={isOverdue ? "destructive" : isPending ? "outline" : "secondary"}
                                className="mt-1"
                              >
                                {isOverdue 
                                  ? `${Math.abs(daysUntil)} dias vencido`
                                  : isPending
                                  ? `${daysUntil} dias`
                                  : `${daysUntil} dias`
                                }
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1 text-gray-400" />
                                {report.technician.user.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedReport(report)
                                    setReportImages(report.images?.map(img => ({
                                      id: img.id,
                                      url: img.url,
                                      path: img.url,
                                      filename: img.filename,
                                      size: 0,
                                      description: img.description,
                                      uploadDate: new Date(img.uploadDate)
                                    })) || [])
                                    setIsEditingImages(false)
                                  }}>
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Relatório PMOC - {selectedReport?.reportNumber}</DialogTitle>
                                    <DialogDescription>
                                      Relatório de Manutenção Preventiva Obrigatória Conforme Lei nº 13.589/2018
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedReport && (
                                    <div className="space-y-6">
                                      {/* Header Information */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium mb-2">Informações do Relatório</h4>
                                          <div className="space-y-1 text-sm bg-gray-50 p-4 rounded-lg">
                                            <div><span className="font-medium">Número:</span> {selectedReport.reportNumber}</div>
                                            <div><span className="font-medium">Gerado em:</span> {new Date(selectedReport.generatedAt).toLocaleDateString('pt-BR')}</div>
                                            <div><span className="font-medium">Data da Inspeção:</span> {new Date(selectedReport.inspectionDate).toLocaleDateString('pt-BR')}</div>
                                            <div><span className="font-medium">Próxima Inspeção:</span> {new Date(selectedReport.nextInspection).toLocaleDateString('pt-BR')}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                              <span className="font-medium">Status:</span>
                                              <Badge variant={getStatusBadgeVariant(selectedReport.complianceStatus)}>
                                                {getStatusLabel(selectedReport.complianceStatus)}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-medium mb-2">Responsável Técnico</h4>
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="font-medium">{selectedReport.technician.user.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                              <div>{selectedReport.technician.user.email}</div>
                                              {selectedReport.technician.user.phone && (
                                                <div>{selectedReport.technician.user.phone}</div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Equipment Information */}
                                      <div>
                                        <h4 className="font-medium mb-2">Equipamento Inspecionado</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="font-medium">{selectedReport.equipment.name}</div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            <div>Tipo: {selectedReport.equipment.type}</div>
                                            {selectedReport.equipment.brand && (
                                              <div>Marca: {selectedReport.equipment.brand}</div>
                                            )}
                                            {selectedReport.equipment.model && (
                                              <div>Modelo: {selectedReport.equipment.model}</div>
                                            )}
                                            {selectedReport.equipment.serialNumber && (
                                              <div>Número de Série: {selectedReport.equipment.serialNumber}</div>
                                            )}
                                            {selectedReport.equipment.location && (
                                              <div>Localização: {selectedReport.equipment.location}</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Client Information */}
                                      <div>
                                        <h4 className="font-medium mb-2">Cliente</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="font-medium">
                                            {selectedReport.equipment.client.companyName || selectedReport.equipment.client.user.name}
                                          </div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            <div>{selectedReport.equipment.client.user.email}</div>
                                            {selectedReport.equipment.client.user.phone && (
                                              <div>{selectedReport.equipment.client.user.phone}</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Measurements */}
                                      {(selectedReport.temperature || selectedReport.pressure || selectedReport.gasLevel) && (
                                        <div>
                                          <h4 className="font-medium mb-2">Medições Realizadas</h4>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {selectedReport.temperature && (
                                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                  {selectedReport.temperature}°C
                                                </div>
                                                <div className="text-sm text-gray-600">Temperatura</div>
                                              </div>
                                            )}
                                            {selectedReport.pressure && (
                                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                  {selectedReport.pressure} PSI
                                                </div>
                                                <div className="text-sm text-gray-600">Pressão</div>
                                              </div>
                                            )}
                                            {selectedReport.gasLevel && (
                                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-purple-600">
                                                  {selectedReport.gasLevel}%
                                                </div>
                                                <div className="text-sm text-gray-600">Nível de Gás</div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Findings */}
                                      <div>
                                        <h4 className="font-medium mb-2">Constatações</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <p className="text-sm whitespace-pre-wrap">{selectedReport.findings}</p>
                                        </div>
                                      </div>

                                      {/* Recommendations */}
                                      <div>
                                        <h4 className="font-medium mb-2">Recomendações</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <p className="text-sm whitespace-pre-wrap">{selectedReport.recommendations}</p>
                                        </div>
                                      </div>

                                      {/* Electrical Readings */}
                                      {selectedReport.electricalReadings && (
                                        <div>
                                          <h4 className="font-medium mb-2">Leituras Elétricas</h4>
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm whitespace-pre-wrap">{selectedReport.electricalReadings}</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Images Section */}
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium">Imagens do Relatório</h4>
                                          {!isEditingImages ? (
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => setIsEditingImages(true)}
                                            >
                                              <ImageIcon className="mr-2 h-4 w-4" />
                                              Gerenciar Imagens
                                            </Button>
                                          ) : (
                                            <div className="flex gap-2">
                                              <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setIsEditingImages(false)}
                                              >
                                                Cancelar
                                              </Button>
                                              <Button 
                                                size="sm"
                                                onClick={handleSaveImages}
                                              >
                                                Salvar Imagens
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {isEditingImages ? (
                                          <ImageUpload
                                            onImagesChange={handleImagesChange}
                                            images={reportImages}
                                            maxImages={20}
                                            folder={`pmoc-reports/${selectedReport.id}`}
                                            title="Upload de Imagens do Relatório"
                                            description="Adicione fotos do equipamento, medições e condições encontradas"
                                          />
                                        ) : (
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            {selectedReport.images && selectedReport.images.length > 0 ? (
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {selectedReport.images.map((image) => (
                                                  <div key={image.id} className="relative group">
                                                    <div className="aspect-square rounded-lg overflow-hidden border">
                                                      <img
                                                        src={image.url}
                                                        alt={image.filename}
                                                        className="w-full h-full object-cover"
                                                      />
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-1 rounded-b-lg">
                                                      <p className="text-xs truncate">{image.filename}</p>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-8 text-gray-500">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                                <p className="text-sm">Nenhuma imagem adicionada ao relatório</p>
                                                <p className="text-xs mt-1">Clique em "Gerenciar Imagens" para adicionar fotos</p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex gap-2 pt-4 border-t">
                                        <Button 
                                          onClick={() => generatePDF(selectedReport.id)}
                                          className="flex-1"
                                        >
                                          <FileDown className="mr-2 h-4 w-4" />
                                          Baixar PDF
                                        </Button>
                                        <Button 
                                          variant="outline"
                                          onClick={() => shareViaWhatsApp(selectedReport)}
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
                                onClick={() => generatePDF(report.id)}
                                title="Baixar PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => shareViaWhatsApp(report)}
                                title="Compartilhar WhatsApp"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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