import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

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
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Usuário com este email já existe" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role: role as UserRole
    }

    const user = await db.user.create({
      data: userData
    })

    // Create role-specific profile
    if (role === "CLIENT") {
      await db.client.create({
        data: {
          userId: user.id,
          companyName,
          document
        }
      })
    } else if (role === "TECHNICIAN") {
      await db.technician.create({
        data: {
          userId: user.id,
          licenseNumber,
          specialty
        }
      })
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