// Tipos locais para substituir as enumerações do Prisma

export enum UserRole {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  CLIENT = 'CLIENT'
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ServiceType {
  INSTALLATION = 'INSTALLATION',
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION'
}

export enum FinancialStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum FinancialType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum ReceiptStatus {
  PENDING = 'PENDING',
  ISSUED = 'ISSUED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  client_id: string
  technician_id: string
  type: ServiceType
  status: ServiceStatus
  title: string
  description: string
  scheduled_date: string
  completed_date?: string
  created_at: string
  updated_at: string
}

export interface Financial {
  id: string
  description: string
  amount: number
  type: FinancialType
  status: FinancialStatus
  date: string
  due_date?: string
  client_id?: string
  service_id?: string
  created_at: string
  updated_at: string
}

export interface Receipt {
  id: string
  financial_id: string
  number: string
  amount: number
  status: ReceiptStatus
  issued_date?: string
  created_at: string
  updated_at: string
}

export interface PMOC {
  id: string
  building_id: string
  client_id: string
  technician_id: string
  report_date: string
  next_maintenance: string
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
  observations: string
  recommendations: string
  created_at: string
  updated_at: string
}

export interface PMOCImage {
  id: string
  pmoc_id: string
  image_url: string
  description?: string
  created_at: string
}