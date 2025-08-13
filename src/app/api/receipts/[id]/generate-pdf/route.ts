import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receiptId = params.id

    // Fetch the receipt with all related data
    const receipt = await db.receipt.findUnique({
      where: { id: receiptId },
      include: {
        service: {
          include: {
            client: {
              include: {
                user: true
              }
            }
          }
        },
        user: true
      }
    })

    if (!receipt) {
      return NextResponse.json(
        { error: "Recibo não encontrado" },
        { status: 404 }
      )
    }

    // Generate PDF content (simplified version)
    const pdfContent = generatePDFContent(receipt)

    // For now, we'll return a simple text response
    // In a real implementation, you would generate an actual PDF file
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recibo-${receipt.receiptNumber}.pdf"`
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

function generatePDFContent(receipt: any): string {
  // This is a simplified version - in production, use a proper PDF generation library
  const content = `
RECIBO DE PAGAMENTO - ${receipt.receiptNumber}
===========================================

DATA DE EMISSÃO: ${new Date(receipt.issuedAt).toLocaleDateString('pt-BR')}
STATUS: ${receipt.status}

RECEBEMOS DE:
${receipt.service.client.companyName || receipt.service.client.user.name}
${receipt.service.client.user.email}
${receipt.service.client.user.phone ? `Telefone: ${receipt.service.client.user.phone}` : ''}

A IMPORTÂNCIA DE:
R$ ${receipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

REFERENTE A:
${receipt.description}

SERVIÇO:
${receipt.service.title}

FORMA DE PAGAMENTO:
${receipt.paymentMethod || 'Não informado'}

EMITIDO POR:
${receipt.user.name}
${receipt.user.email}

---
Este recibo foi gerado automaticamente pelo sistema HVAC Pro
e tem validade fiscal conforme legislação vigente.
`

  return content
}