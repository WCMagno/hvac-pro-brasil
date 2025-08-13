import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get("equipmentId") as string | null
    const technicianId = searchParams.get("technicianId") as string | null
    const status = searchParams.get("status") as string | null

    const supabase = createClient()
    
    let query = supabase
      .from('pmoc_reports')
      .select(`
        *,
        equipment (
          *,
          client (
            *,
            user (*)
          )
        ),
        technician (
          *,
          user (*)
        ),
        service (
          id,
          title
        ),
        report_images (
          id,
          url,
          filename,
          description,
          upload_date
        )
      `)

    // Apply filters
    if (equipmentId) {
      query = query.eq('equipment_id', equipmentId)
    }
    
    if (technicianId) {
      query = query.eq('technician_id', technicianId)
    }
    
    if (status) {
      query = query.eq('compliance_status', status)
    }

    const { data: reports, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching PMOC reports:", error)
      return NextResponse.json(
        { error: "Erro ao buscar relatórios PMOC" },
        { status: 500 }
      )
    }

    // Transform data to match expected format
    const transformedReports = reports?.map(report => ({
      id: report.id,
      reportNumber: report.report_number,
      generatedAt: report.created_at,
      inspectionDate: report.inspection_date,
      nextInspection: report.next_inspection_date,
      findings: report.observations,
      recommendations: report.recommendations,
      complianceStatus: report.compliance_status,
      temperature: report.temperature,
      pressure: report.pressure,
      gasLevel: report.gas_level,
      electricalReadings: report.electrical_readings,
      pdfUrl: report.pdf_url,
      images: report.report_images?.map(img => ({
        id: img.id,
        url: img.url,
        filename: img.image_name,
        description: img.description,
        uploadDate: img.upload_date
      })) || [],
      equipment: {
        id: report.equipment.id,
        name: report.equipment.name,
        type: report.equipment.type,
        brand: report.equipment.brand,
        model: report.equipment.model,
        serialNumber: report.equipment.serial_number,
        location: report.equipment.location,
        client: {
          id: report.equipment.client.id,
          companyName: report.equipment.client.company_name,
          user: {
            name: report.equipment.client.user.name,
            email: report.equipment.client.user.email,
            phone: report.equipment.client.user.phone
          }
        }
      },
      technician: {
        id: report.technician.id,
        user: {
          name: report.technician.user.name,
          email: report.technician.user.email,
          phone: report.technician.user.phone
        }
      },
      service: report.service ? {
        id: report.service.id,
        title: report.service.title
      } : null
    }))

    return NextResponse.json(transformedReports || [])
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

    const supabase = createClient()

    // Generate report number
    const { count } = await supabase
      .from('pmoc_reports')
      .select('*', { count: 'exact', head: true })
    
    const reportNumber = `PMOC-${String((count || 0) + 1).padStart(6, '0')}`

    // Create PMOC report
    const { data: report, error } = await supabase
      .from('pmoc_reports')
      .insert([{
        equipment_id: equipmentId,
        technician_id: technicianId,
        service_request_id: serviceId,
        report_number: reportNumber,
        inspection_date: inspectionDate,
        next_inspection_date: nextInspection,
        observations: findings,
        recommendations: recommendations,
        compliance_status: complianceStatus,
        temperature: temperature ? parseFloat(temperature) : null,
        pressure: pressure ? parseFloat(pressure) : null,
        gas_level: gasLevel ? parseFloat(gasLevel) : null,
        electrical_readings: electricalReadings
      }])
      .select(`
        *,
        equipment (
          *,
          client (
            *,
            user (*)
          )
        ),
        technician (
          *,
          user (*)
        ),
        service (
          id,
          title
        )
      `)
      .single()

    if (error) {
      console.error("Error creating PMOC report:", error)
      return NextResponse.json(
        { error: "Erro ao criar relatório PMOC" },
        { status: 500 }
      )
    }

    // Transform data to match expected format
    const transformedReport = {
      id: report.id,
      reportNumber: report.report_number,
      generatedAt: report.created_at,
      inspectionDate: report.inspection_date,
      nextInspection: report.next_inspection_date,
      findings: report.observations,
      recommendations: report.recommendations,
      complianceStatus: report.compliance_status,
      temperature: report.temperature,
      pressure: report.pressure,
      gasLevel: report.gas_level,
      electricalReadings: report.electrical_readings,
      pdfUrl: report.pdf_url,
      images: [],
      equipment: {
        id: report.equipment.id,
        name: report.equipment.name,
        type: report.equipment.type,
        brand: report.equipment.brand,
        model: report.equipment.model,
        serialNumber: report.equipment.serial_number,
        location: report.equipment.location,
        client: {
          id: report.equipment.client.id,
          companyName: report.equipment.client.company_name,
          user: {
            name: report.equipment.client.user.name,
            email: report.equipment.client.user.email,
            phone: report.equipment.client.user.phone
          }
        }
      },
      technician: {
        id: report.technician.id,
        user: {
          name: report.technician.user.name,
          email: report.technician.user.email,
          phone: report.technician.user.phone
        }
      },
      service: report.service ? {
        id: report.service.id,
        title: report.service.title
      } : null
    }

    return NextResponse.json(
      { message: "Relatório PMOC criado com sucesso", report: transformedReport },
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