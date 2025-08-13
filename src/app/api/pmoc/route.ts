import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get("equipmentId") as string | null
    const technicianId = searchParams.get("technicianId") as string | null
    const status = searchParams.get("status") as string | null

    const whereClause: any = {}
    
    if (equipmentId) {
      whereClause.equipmentId = equipmentId
    }
    
    if (technicianId) {
      whereClause.technicianId = technicianId
    }
    
    if (status) {
      whereClause.complianceStatus = status
    }

    const reports = await db.pMOCReport.findMany({
      where: whereClause,
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
      },
      orderBy: {
        generatedAt: "desc"
      }
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching PMOC reports:", error)
    return NextResponse.json(
      { error: "Erro ao buscar relatórios PMOC" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      equipmentId,
      technicianId,
      serviceId,
      inspectionDate,
      nextInspection,
      findings,
      recommendations,
      complianceStatus,
      temperature,
      pressure,
      gasLevel,
      electricalReadings
    } = body

    // Validate required fields
    if (!equipmentId || !technicianId || !inspectionDate || !nextInspection || !findings || !recommendations) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      )
    }

    // Generate report number
    const reportCount = await db.pMOCReport.count()
    const reportNumber = `PMOC-${String(reportCount + 1).padStart(6, '0')}`

    // Create PMOC report
    const report = await db.pMOCReport.create({
      data: {
        equipmentId,
        technicianId,
        serviceId,
        reportNumber,
        inspectionDate: new Date(inspectionDate),
        nextInspection: new Date(nextInspection),
        findings,
        recommendations,
        complianceStatus,
        temperature: temperature ? parseFloat(temperature) : null,
        pressure: pressure ? parseFloat(pressure) : null,
        gasLevel: gasLevel ? parseFloat(gasLevel) : null,
        electricalReadings
      },
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

    return NextResponse.json(
      { message: "Relatório PMOC criado com sucesso", report },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating PMOC report:", error)
    return NextResponse.json(
      { error: "Erro ao criar relatório PMOC" },
      { status: 500 }
    )
  }
}