import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createClient } from "@/lib/supabase"
import { UserRole } from "@/types"

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

    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
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
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash: hashedPassword,
        phone,
        role: role as UserRole
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json(
        { error: "Erro ao criar usuário" },
        { status: 500 }
      )
    }

    // Create role-specific profile
    if (role === "CLIENT") {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          company_name: companyName,
          document
        })

      if (clientError) {
        console.error("Error creating client profile:", clientError)
      }
    } else if (role === "TECHNICIAN") {
      const { error: technicianError } = await supabase
        .from('technicians')
        .insert({
          user_id: user.id,
          license_number: licenseNumber,
          specialty
        })

      if (technicianError) {
        console.error("Error creating technician profile:", technicianError)
      }
    }

    return NextResponse.json(
      { message: "Usuário criado com sucesso" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}