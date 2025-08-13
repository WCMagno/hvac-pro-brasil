"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Thermometer, User, Building, Wrench } from "lucide-react"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  role: "CLIENT" | "TECHNICIAN"
  companyName?: string
  document?: string
  licenseNumber?: string
  specialty?: string
}

export default function SignUp() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "CLIENT",
    companyName: "",
    document: "",
    licenseNumber: "",
    specialty: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    // Validate required fields based on role
    if (formData.role === "CLIENT" && !formData.companyName) {
      setError("Nome da empresa é obrigatório para clientes")
      setIsLoading(false)
      return
    }

    if (formData.role === "TECHNICIAN" && !formData.licenseNumber) {
      setError("Número de licença é obrigatório para técnicos")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
          ...(formData.role === "CLIENT" && {
            companyName: formData.companyName,
            document: formData.document
          }),
          ...(formData.role === "TECHNICIAN" && {
            licenseNumber: formData.licenseNumber,
            specialty: formData.specialty
          })
        }),
      })

      if (response.ok) {
        router.push("/auth/signin?message=Registro realizado com sucesso")
      } else {
        const data = await response.json()
        setError(data.error || "Ocorreu um erro ao criar conta")
      }
    } catch (error) {
      setError("Ocorreu um erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HVAC Pro</h1>
                <p className="text-sm text-gray-500">Manutenção & PMOC</p>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Cadastre-se para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Conta</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      Cliente
                    </div>
                  </SelectItem>
                  <SelectItem value="TECHNICIAN">
                    <div className="flex items-center">
                      <Wrench className="mr-2 h-4 w-4" />
                      Técnico
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.role === "CLIENT" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="Nome da sua empresa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">CNPJ/CPF</Label>
                  <Input
                    id="document"
                    type="text"
                    value={formData.document}
                    onChange={(e) => handleChange("document", e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </>
            )}
            
            {formData.role === "TECHNICIAN" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Número de Licença</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange("licenseNumber", e.target.value)}
                    placeholder="Sua licença de técnico"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => handleChange("specialty", e.target.value)}
                    placeholder="Ex: Split, Central, Comercial"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <a href="/auth/signin" className="text-blue-600 hover:underline">
                Faça login
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}