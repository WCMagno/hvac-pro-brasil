import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id
    const supabase = createClient()

    // Fetch the PMOC report with all related data
    const { data: report, error } = await supabase
      .from('pmoc_reports')
      .select(`
        *,
        building:buildings(
          id,
          name,
          address,
          client:clients(
            id,
            company_name,
            user:users(
              id,
              name,
              email,
              phone
            )
          )
        ),
        technician:technicians(
          id,
          license_number,
          specialty,
          user:users(
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq('id', reportId)
      .single()

    if (error || !report) {
      return NextResponse.json(
        { error: "Relatório PMOC não encontrado" },
        { status: 404 }
      )
    }

    // Fetch PMOC images
    const { data: images } = await supabase
      .from('pmoc_images')
      .select('*')
      .eq('pmoc_id', reportId)

    // Generate PDF content (simplified version - in production, use a proper PDF library like jsPDF or Puppeteer)
    const pdfContent = generatePDFContent(report, images || [])

    // For now, we'll return a simple text response
    // In a real implementation, you would generate an actual PDF file
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pmoc-${reportId}.pdf"`
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

function generatePDFContent(report: any, images: any[]): string {
  // This is a simplified version - in production, use a proper PDF generation library
  const content = `
RELATÓRIO PMOC - ${report.id}
===================================

Lei nº 13.589/2018 - Programa de Manutenção Preventiva Obrigatória

DATA DO RELATÓRIO: ${new Date(report.created_at).toLocaleDateString('pt-BR')}
DATA DA INSPEÇÃO: ${new Date(report.report_date).toLocaleDateString('pt-BR')}
PRÓXIMA INSPEÇÃO: ${new Date(report.next_maintenance).toLocaleDateString('pt-BR')}

STATUS: ${report.status}

DADOS DO PRÉDIO:
- Nome: ${report.building.name}
- Endereço: ${report.building.address}

DADOS DO CLIENTE:
- Empresa: ${report.building.client.company_name}
- Nome: ${report.building.client.user.name}
- Email: ${report.building.client.user.email}
- Telefone: ${report.building.client.user.phone || 'Não informado'}

RESPONSÁVEL TÉCNICO:
- Nome: ${report.technician.user.name}
- Email: ${report.technician.user.email}
- Telefone: ${report.technician.user.phone || 'Não informado'}
- Licença: ${report.technician.license_number}
- Especialidade: ${report.technician.specialty}

OBSERVAÇÕES:
${report.observations}

RECOMENDAÇÕES:
${report.recommendations}

IMAGENS ANEXADAS: ${images.length} imagem(ns)
${images.map((img, index) => `- Imagem ${index + 1}: ${img.description || 'Sem descrição'}`).join('\n')}

---
Este relatório foi gerado automaticamente pelo sistema HVAC Pro
em conformidade com a Lei nº 13.589/2018.
`

  return content
}