import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId") as string | null
    const userId = searchParams.get("userId") as string | null
    const status = searchParams.get("status") as string | null

    const whereClause: any = {}
    
    if (serviceId) {
      whereClause.serviceId = serviceId
    }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (status) {
      whereClause.status = status
    }

    const receipts = await db.receipt.findMany({
      where: whereClause,
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
      },
      orderBy: {
        issuedAt: "desc"
      }
    })

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
      serviceId,
      userId,
      amount,
      description,
      paymentMethod,
      status
    } = body

    // Validate required fields
    if (!serviceId || !userId || !amount || !description) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      )
    }

    // Generate receipt number
    const receiptCount = await db.receipt.count()
    const receiptNumber = `REC-${String(receiptCount + 1).padStart(6, '0')}`

    // Create receipt
    const receipt = await db.receipt.create({
      data: {
        serviceId,
        userId,
        receiptNumber,
        amount: parseFloat(amount),
        description,
        paymentMethod,
        status: status || "ISSUED"
      },
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