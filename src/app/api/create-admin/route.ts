import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const adminData = {
      email: 'admin@hvacpro.com.br',
      name: 'Admin',
      role: 'ADMIN',
      password_hash: await bcrypt.hash('admin#1234', 12)
    }

    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminData.email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: 'Usuário admin já existe' 
      })
    }

    // Inserir novo usuário
    const { data, error } = await supabase
      .from('users')
      .insert([adminData])
      .select()

    if (error) {
      console.error('Erro ao criar usuário admin:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log('Usuário admin criado com sucesso:', data)
    return NextResponse.json({ 
      success: true, 
      message: 'Usuário admin criado com sucesso',
      data 
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}