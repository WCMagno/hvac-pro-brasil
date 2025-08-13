import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id

    // Fetch the PMOC report with all related data
    const report = await db.pMOCReport.findUnique({
      where: { id: reportId },
      include: {
        equipment: {
          include: {
            client: {
              include: {
                user: true
              }
            }
          }
        },
        technician: {
          include: {
            user: true
          }
        },
        service: true
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: "Relatório PMOC não encontrado" },
        { status: 404 }
      )
    }

    // Generate PDF content (simplified version - in production, use a proper PDF library like jsPDF or Puppeteer)
    const pdfContent = generatePDFContent(report)

    // For now, we'll return a simple text response
    // In a real implementation, you would generate an actual PDF file
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pmoc-${report.reportNumber}.pdf"`
      }
    })

  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    )
  }
}

function generatePDFContent(report: any): string {
  // This is a simplified version - in production, use a proper PDF generation library
  const content = `
RELATÓRIO PMOC - ${report.reportNumber}
===================================

Lei nº 13.589/2018 - Programa de Manutenção Preventiva Obrigatória

DATA DO RELATÓRIO: ${new Date(report.generatedAt).toLocaleDateString('pt-BR')}
DATA DA INSPEÇÃO: ${new Date(report.inspectionDate).toLocaleDateString('pt-BR')}
PRÓXIMA INSPEÇÃO: ${new Date(report.nextInspection).toLocaleDateString('pt-BR')}

STATUS DE CONFORMIDADE: ${report.complianceStatus}

DADOS DO EQUIPAMENTO:
- Nome: ${report.equipment.name}
- Tipo: ${report.equipment.type}
- Marca: ${report.equipment.brand || 'Não informado'}
- Modelo: ${report.equipment.model || 'Não informado'}
- Número de Série: ${report.equipment.serialNumber || 'Não informado'}
- Localização: ${report.equipment.location || 'Não informado'}

DADOS DO CLIENTE:
- Nome: ${report.equipment.client.companyName || report.equipment.client.user.name}
- Email: ${report.equipment.client.user.email}
- Telefone: ${report.equipment.client.user.phone || 'Não informado'}

RESPONSÁVEL TÉCNICO:
- Nome: ${report.technician.user.name}
- Email: ${report.technician.user.email}
- Telefone: ${report.technician.user.phone || 'Não informado'}

MEDIÇÕES REALIZADAS:
${report.temperature ? `- Temperatura: ${report.temperature}°C` : ''}
${report.pressure ? `- Pressão: ${report.pressure} PSI` : ''}
${report.gasLevel ? `- Nível de Gás: ${report.gasLevel}%` : ''}

CONSTATAÇÕES:
${report.findings}

RECOMENDAÇÕES:
${report.recommendations}

${report.electricalReadings ? `LEITURAS ELÉTRICAS:\n${report.electricalReadings}` : ''}

---
Este relatório foi gerado automaticamente pelo sistema HVAC Pro
em conformidade com a Lei nº 13.589/2018.
`

  return content
}