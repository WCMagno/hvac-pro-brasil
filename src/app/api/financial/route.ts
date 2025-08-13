import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { PaymentStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as string | null
    const status = searchParams.get("status") as PaymentStatus | null
    const userId = searchParams.get("userId") as string | null
    const startDate = searchParams.get("startDate") as string | null
    const endDate = searchParams.get("endDate") as string | null

    const whereClause: any = {}
    
    if (type) {
      whereClause.type = type
    }
    
    if (status) {
      whereClause.status = status
    }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const transactions = await db.financialTransaction.findMany({
      where: whereClause,
      include: {
        user: true,
        service: {
          include: {
            client: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(transactions)
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

    // Create financial transaction
    const transaction = await db.financialTransaction.create({
      data: {
        serviceId,
        userId,
        type,
        description,
        amount: parseFloat(amount),
        status: status || "PENDING",
        dueDate: dueDate ? new Date(dueDate) : null,
        paymentMethod,
        notes
      },
      include: {
        user: true,
        service: {
          include: {
            client: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      { message: "Transação criada com sucesso", transaction },
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