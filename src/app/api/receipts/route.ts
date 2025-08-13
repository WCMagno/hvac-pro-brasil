import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const financialId = searchParams.get("financialId") as string | null
    const status = searchParams.get("status") as string | null

    const supabase = createClient()
    
    let query = supabase
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
          service_id
        )
      `)
    
    if (financialId) {
      query = query.eq('financial_id', financialId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data: receipts, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching receipts:", error)
      return NextResponse.json(
        { error: "Erro ao buscar recibos" },
        { status: 500 }
      )
    }

    return NextResponse.json(receipts)
  } catch (error) {
    console.error("Error fetching receipts:", error)
    return NextResponse.json(
      { error: "Erro ao buscar recibos" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      financialId,
      amount,
      description
    } = body

    // Validate required fields
    if (!financialId || !amount || !description) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Generate receipt number
    const { data: lastReceipt } = await supabase
      .from('receipts')
      .select('number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const receiptCount = lastReceipt ? parseInt(lastReceipt.number.replace('REC-', '')) : 0
    const receiptNumber = `REC-${String(receiptCount + 1).padStart(6, '0')}`

    // Create receipt
    const { data: receipt, error } = await supabase
      .from('receipts')
      .insert({
        financial_id: financialId,
        number: receiptNumber,
        amount: parseFloat(amount),
        status: 'ISSUED'
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating receipt:", error)
      return NextResponse.json(
        { error: "Erro ao criar recibo" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Recibo criado com sucesso", receipt },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating receipt:", error)
    return NextResponse.json(
      { error: "Erro ao criar recibo" },
      { status: 500 }
    )
  }
}