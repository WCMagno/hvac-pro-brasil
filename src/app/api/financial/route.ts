import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as string | null
    const status = searchParams.get("status") as string | null
    const userId = searchParams.get("userId") as string | null
    const startDate = searchParams.get("startDate") as string | null
    const endDate = searchParams.get("endDate") as string | null

    const supabase = createClient()
    
    let query = supabase
      .from('financial_transactions')
      .select(`
        *,
        client:clients (
          *,
          user (*)
        ),
        service_request (
          id,
          title
        )
      `)

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (userId) {
      query = query.eq('client_id', userId)
    }
    
    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate)
    }

    const { data: transactions, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching financial transactions:", error)
      return NextResponse.json(
        { error: "Erro ao buscar transações financeiras" },
        { status: 500 }
      )
    }

    // Transform data to match expected format
    const transformedTransactions = transactions?.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount,
      status: transaction.status,
      dueDate: transaction.due_date,
      paymentDate: transaction.payment_date,
      paymentMethod: transaction.payment_method,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
      user: transaction.client ? {
        id: transaction.client.user.id,
        name: transaction.client.user.name,
        email: transaction.client.user.email,
        phone: transaction.client.user.phone
      } : null,
      service: transaction.service_request ? {
        id: transaction.service_request.id,
        title: transaction.service_request.title
      } : null
    }))

    return NextResponse.json(transformedTransactions || [])
  } catch (error) {
    console.error("Error fetching financial transactions:", error)
    return NextResponse.json(
      { error: "Erro ao buscar transações financeiras" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      serviceId,
      userId,
      type,
      description,
      amount,
      status,
      dueDate,
      paymentMethod,
      notes
    } = body

    // Validate required fields
    if (!userId || !type || !description || !amount) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Create financial transaction
    const { data: transaction, error } = await supabase
      .from('financial_transactions')
      .insert([{
        client_id: userId,
        service_request_id: serviceId,
        type,
        description,
        amount: parseFloat(amount),
        status: status || "PENDING",
        due_date: dueDate || null,
        payment_date: status === "PAID" ? new Date().toISOString() : null,
        payment_method: paymentMethod
      }])
      .select(`
        *,
        client:clients (
          *,
          user (*)
        ),
        service_request (
          id,
          title
        )
      `)
      .single()

    if (error) {
      console.error("Error creating financial transaction:", error)
      return NextResponse.json(
        { error: "Erro ao criar transação financeira" },
        { status: 500 }
      )
    }

    // Transform data to match expected format
    const transformedTransaction = {
      id: transaction.id,
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount,
      status: transaction.status,
      dueDate: transaction.due_date,
      paymentDate: transaction.payment_date,
      paymentMethod: transaction.payment_method,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
      user: transaction.client ? {
        id: transaction.client.user.id,
        name: transaction.client.user.name,
        email: transaction.client.user.email,
        phone: transaction.client.user.phone
      } : null,
      service: transaction.service_request ? {
        id: transaction.service_request.id,
        title: transaction.service_request.title
      } : null
    }

    return NextResponse.json(
      { message: "Transação criada com sucesso", transaction: transformedTransaction },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating financial transaction:", error)
    return NextResponse.json(
      { error: "Erro ao criar transação financeira" },
      { status: 500 }
    )
  }
}