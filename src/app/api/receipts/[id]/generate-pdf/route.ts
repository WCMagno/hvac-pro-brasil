import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receiptId = params.id
    const supabase = createClient()

    // Fetch the receipt with all related data
    const { data: receipt, error } = await supabase
      .from('receipts')
      .select(`
        *,
        financial:financial(
          id,
          description,
          amount,
          type,
          status,
          date,
          client_id,
          service_id,
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
        )
      `)
      .eq('id', receiptId)
      .single()

    if (error || !receipt) {
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
        'Content-Disposition': `attachment; filename="recibo-${receipt.number}.pdf"`
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
RECIBO DE PAGAMENTO - ${receipt.number}
===========================================

DATA DE EMISSÃO: ${new Date(receipt.created_at).toLocaleDateString('pt-BR')}
STATUS: ${receipt.status}

RECEBEMOS DE:
${receipt.financial.client?.company_name || receipt.financial.client?.user.name}
${receipt.financial.client?.user.email}
${receipt.financial.client?.user.phone ? `Telefone: ${receipt.financial.client.user.phone}` : ''}

A IMPORTÂNCIA DE:
R$ ${receipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

REFERENTE A:
${receipt.financial.description}

TIPO:
${receipt.financial.type === 'INCOME' ? 'Receita' : 'Despesa'}

DATA DA TRANSAÇÃO:
${new Date(receipt.financial.date).toLocaleDateString('pt-BR')}

---
Este recibo foi gerado automaticamente pelo sistema HVAC Pro
e tem validade fiscal conforme legislação vigente.
`

  return content
}