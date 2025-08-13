import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const supabase = createClient()
        
        try {
          // Buscar usuário na tabela users do Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            console.error("Usuário não encontrado:", error)
            return null
          }

          // Verificar senha (hash bcrypt)
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            console.error("Senha inválida")
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: null,
          }
        } catch (error) {
          console.error("Erro na autenticação:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup"
  }
}