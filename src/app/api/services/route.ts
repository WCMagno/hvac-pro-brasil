import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ServiceStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as ServiceStatus | null
    const priority = searchParams.get("priority") as string | null
    const clientId = searchParams.get("clientId") as string | null
    const technicianId = searchParams.get("technicianId") as string | null

    const whereClause: any = {}
    
    if (status) {
      whereClause.status = status
    }
    
    if (priority) {
      whereClause.priority = priority
    }
    
    if (clientId) {
      whereClause.clientId = clientId
    }
    
    if (technicianId) {
      whereClause.assignments = {
        some: {
          technicianId: technicianId
        }
      }
    }

    const services = await db.serviceRequest.findMany({
      where: whereClause,
      include: {
        client: {
          include: {
            user: true
          }
        },
        equipment: true,
        assignments: {
          include: {
            technician: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        requestedDate: "desc"
      }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
      equipmentId,
      title,
      description,
      priority,
      scheduledDate,
      estimatedCost
    } = body

    // Validate required fields
    if (!clientId || !title || !description) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      )
    }

    // Create service request
    const service = await db.serviceRequest.create({
      data: {
        clientId,
        equipmentId,
        title,
        description,
        priority: priority || "MEDIUM",
        status: "PENDING",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        estimatedCost: estimatedCost || null,
        createdBy: body.createdBy // This should come from the authenticated user
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        equipment: true,
        assignments: {
          include: {
            technician: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      { message: "Serviço criado com sucesso", service },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 }
    )
  }
}