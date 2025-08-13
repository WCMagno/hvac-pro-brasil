import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") as string | null
    const search = searchParams.get("search") || ""

    const supabase = createClient()
    
    let query = supabase
      .from('users')
      .select(`
        *,
        client:clients (*),
        technician:technicians (*)
      `)

    // Apply filters
    if (role && role !== "ALL") {
      query = query.eq('role', role)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json(
        { error: "Erro ao buscar usuários" },
        { status: 500 }
      )
    }

    // Transform data to match expected format
    const transformedUsers = users?.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      clientProfile: user.client ? {
        id: user.client.id,
        companyName: user.client.company_name,
        document: user.client.document_number,
        address: user.client.address
      } : null,
      technicianProfile: user.technician ? {
        id: user.technician.id,
        licenseNumber: user.technician.license_number,
        specialty: user.technician.specialty,
        certificationExpiration: user.technician.certification_expiration,
        status: user.technician.status
      } : null
    }))

    return NextResponse.json(transformedUsers || [])
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      role,
      companyName,
      document,
      licenseNumber,
      specialty
    } = body

    // Check if user already exists
    const supabase = createClient()
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "Usuário com este email já existe" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        password_hash: hashedPassword,
        phone,
        role
      }])
      .select()
      .single()

    if (userError) {
      console.error("Error creating user:", userError)
      return NextResponse.json(
        { error: "Erro ao criar usuário" },
        { status: 500 }
      )
    }

    // Create role-specific profile
    if (role === "CLIENT") {
      const { error: clientError } = await supabase
        .from('clients')
        .insert([{
          user_id: user.id,
          company_name: companyName,
          document_number: document
        }])

      if (clientError) {
        console.error("Error creating client profile:", clientError)
        // Rollback user creation
        await supabase.from('users').delete().eq('id', user.id)
        return NextResponse.json(
          { error: "Erro ao criar perfil de cliente" },
          { status: 500 }
        )
      }
    } else if (role === "TECHNICIAN") {
      const { error: technicianError } = await supabase
        .from('technicians')
        .insert([{
          user_id: user.id,
          license_number: licenseNumber,
          specialty
        }])

      if (technicianError) {
        console.error("Error creating technician profile:", technicianError)
        // Rollback user creation
        await supabase.from('users').delete().eq('id', user.id)
        return NextResponse.json(
          { error: "Erro ao criar perfil de técnico" },
          { status: 500 }
        )
      }
    }

    // Return transformed user data
    const transformedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      clientProfile: role === "CLIENT" ? {
        id: user.id, // This would be the client profile ID
        companyName: companyName,
        document: document
      } : null,
      technicianProfile: role === "TECHNICIAN" ? {
        id: user.id, // This would be the technician profile ID
        licenseNumber: licenseNumber,
        specialty: specialty
      } : null
    }

    return NextResponse.json(
      { message: "Usuário criado com sucesso", user: transformedUser },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}