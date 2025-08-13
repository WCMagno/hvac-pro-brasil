import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") as UserRole | null
    const search = searchParams.get("search") || ""

    const whereClause: any = {}
    
    if (role && role !== "ALL") {
      whereClause.role = role
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { clientProfile: { companyName: { contains: search, mode: "insensitive" } } }
      ]
    }

    const users = await db.user.findMany({
      where: whereClause,
      include: {
        clientProfile: true,
        technicianProfile: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(users)
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
      { message: "Usuário criado com sucesso", user },
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