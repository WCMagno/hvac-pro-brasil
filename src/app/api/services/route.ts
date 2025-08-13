import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as string | null
    const priority = searchParams.get("priority") as string | null
    const clientId = searchParams.get("clientId") as string | null
    const technicianId = searchParams.get("technicianId") as string | null

    const supabase = createClient()
    
    let query = supabase
      .from('service_requests')
      .select(`
        *,
        client (
          *,
          user (*)
        ),
        equipment (*),
        technician (
          *,
          user (*)
        )
      `)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (priority) {
      query = query.eq('priority', priority)
    }
    
    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    
    if (technicianId) {
      query = query.eq('technician_id', technicianId)
    }

    const { data: services, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching services:", error)
      return NextResponse.json(
        { error: "Erro ao buscar serviços" },
        { status: 500 }
      )
    }

    // Transform data to match expected format
    const transformedServices = services?.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      status: service.status,
      priority: service.priority,
      requestedDate: service.created_at,
      scheduledDate: service.scheduled_date,
      completedDate: service.completed_date,
      estimatedCost: service.estimated_cost,
      actualCost: service.actual_cost,
      client: {
        id: service.client.id,
        companyName: service.client.company_name,
        user: {
          name: service.client.user.name,
          email: service.client.user.email,
          phone: service.client.user.phone
        }
      },
      equipment: service.equipment ? {
        id: service.equipment.id,
        name: service.equipment.name,
        type: service.equipment.type,
        brand: service.equipment.brand,
        model: service.equipment.model
      } : null,
      technician: service.technician ? {
        id: service.technician.id,
        user: {
          name: service.technician.user.name,
          email: service.technician.user.email,
          phone: service.technician.user.phone
        }
      } : null,
      assignments: [] // TODO: Implement assignments if needed
    }))

    return NextResponse.json(transformedServices || [])
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

    const supabase = createClient()

    // Create service request
    const { data: service, error } = await supabase
      .from('service_requests')
      .insert([{
        client_id: clientId,
        equipment_id: equipmentId,
        technician_id: null, // TODO: Add technician assignment logic
        title,
        description,
        priority: priority || "MEDIUM",
        status: "PENDING",
        scheduled_date: scheduledDate || null,
        estimated_cost: estimatedCost || null,
        actual_cost: null,
        completed_date: null
      }])
      .select(`
        *,
        client (
          *,
          user (*)
        ),
        equipment (*),
        technician (
          *,
          user (*)
        )
      `)
      .single()

    if (error) {
      console.error("Error creating service:", error)
      return NextResponse.json(
        { error: "Erro ao criar serviço" },
        { status: 500 }
      )
    }

    // Transform data to match expected format
    const transformedService = {
      id: service.id,
      title: service.title,
      description: service.description,
      status: service.status,
      priority: service.priority,
      requestedDate: service.created_at,
      scheduledDate: service.scheduled_date,
      completedDate: service.completed_date,
      estimatedCost: service.estimated_cost,
      actualCost: service.actual_cost,
      client: {
        id: service.client.id,
        companyName: service.client.company_name,
        user: {
          name: service.client.user.name,
          email: service.client.user.email,
          phone: service.client.user.phone
        }
      },
      equipment: service.equipment ? {
        id: service.equipment.id,
        name: service.equipment.name,
        type: service.equipment.type,
        brand: service.equipment.brand,
        model: service.equipment.model
      } : null,
      technician: service.technician ? {
        id: service.technician.id,
        user: {
          name: service.technician.user.name,
          email: service.technician.user.email,
          phone: service.technician.user.phone
        }
      } : null,
      assignments: []
    }

    return NextResponse.json(
      { message: "Serviço criado com sucesso", service: transformedService },
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