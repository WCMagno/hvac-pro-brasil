import { createClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function createAdminUser() {
  const supabase = createClient()
  
  const adminData = {
    email: 'admin@hvacpro.com.br',
    name: 'Admin',
    role: 'ADMIN',
    password_hash: await bcrypt.hash('admin#1234', 12)
  }

  try {
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminData.email)
      .single()

    if (existingUser) {
      console.log('Usuário admin já existe')
      return { success: true, message: 'Usuário admin já existe' }
    }

    // Inserir novo usuário
    const { data, error } = await supabase
      .from('users')
      .insert([adminData])
      .select()

    if (error) {
      console.error('Erro ao criar usuário admin:', error)
      return { success: false, error: error.message }
    }

    console.log('Usuário admin criado com sucesso:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Erro inesperado:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}

// Função para ser chamada via API route
export async function POST() {
  try {
    const result = await createAdminUser()
    
    if (result.success) {
      return Response.json({ message: 'Usuário admin criado com sucesso' })
    } else {
      return Response.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}