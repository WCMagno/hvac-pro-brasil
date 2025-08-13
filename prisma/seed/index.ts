import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash('admin#1234', 12)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hvacpro.com.br' },
    update: {},
    create: {
      email: 'admin@hvacpro.com.br',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '(11) 99999-9999',
      active: true,
    },
  })

  console.log('Admin user created:', adminUser.email)

  // Create a sample client user
  const clientPassword = await bcrypt.hash('client123', 12)
  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      email: 'cliente@exemplo.com',
      name: 'João Silva',
      password: clientPassword,
      role: 'CLIENT',
      phone: '(11) 98888-8888',
      active: true,
    },
  })

  // Create client profile
  const clientProfile = await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      companyName: 'Empresa ABC Ltda',
      document: '12.345.678/0001-00',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
  })

  // Create a sample technician user
  const techPassword = await bcrypt.hash('tech123', 12)
  const techUser = await prisma.user.upsert({
    where: { email: 'tecnico@exemplo.com' },
    update: {},
    create: {
      email: 'tecnico@exemplo.com',
      name: 'Carlos Santos',
      password: techPassword,
      role: 'TECHNICIAN',
      phone: '(11) 97777-7777',
      active: true,
    },
  })

  // Create technician profile
  const techProfile = await prisma.technician.upsert({
    where: { userId: techUser.id },
    update: {},
    create: {
      userId: techUser.id,
      document: '123.456.789-00',
      licenseNumber: 'TEC-SP-12345',
      specialty: 'Split System, Central AC',
      experience: 5,
      available: true,
      hourlyRate: 150.00,
    },
  })

  // Create sample equipment
  const equipment = await prisma.equipment.create({
    data: {
      clientId: clientProfile.id,
      name: 'Ar Condicionado Split 18000 BTU',
      type: 'SPLIT_SYSTEM',
      brand: 'Carrier',
      model: 'DUTO',
      serialNumber: 'CAR123456789',
      installationDate: new Date('2023-01-15'),
      location: 'Sala Comercial',
      capacity: '18000 BTU',
      lastMaintenance: new Date('2023-12-15'),
      nextMaintenance: new Date('2024-06-15'),
    },
  })

  // Create sample service request
  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      clientId: clientProfile.id,
      equipmentId: equipment.id,
      title: 'Manutenção Preventiva Programada',
      description: 'Realizar manutenção preventiva conforme PMOC',
      priority: 'MEDIUM',
      status: 'PENDING',
      scheduledDate: new Date('2024-01-20'),
      estimatedCost: 250.00,
      createdBy: adminUser.id,
    },
  })

  // Create sample inventory items
  const inventoryItems = [
    {
      name: 'Filtro de Ar Split',
      description: 'Filtro de ar para ar condicionado split',
      category: 'Peças',
      unit: 'UN',
      quantity: 50,
      minQuantity: 10,
      unitPrice: 25.00,
      supplier: 'Fornecedor ABC',
      sku: 'FILTRO-SPLIT-001',
    },
    {
      name: 'Gás Refrigerante R410A',
      description: 'Gás refrigerante R410A para recarga',
      category: 'Insumos',
      unit: 'KG',
      quantity: 20,
      minQuantity: 5,
      unitPrice: 150.00,
      supplier: 'Fornecedor XYZ',
      sku: 'GAS-R410A-001',
    },
    {
      name: 'Capacitor 35uF',
      description: 'Capacitor para compressor de ar condicionado',
      category: 'Peças',
      unit: 'UN',
      quantity: 30,
      minQuantity: 5,
      unitPrice: 45.00,
      supplier: 'Fornecedor ABC',
      sku: 'CAP-35UF-001',
    },
  ]

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    })
  }

  console.log('Database seeded successfully!')
  console.log('Admin credentials: admin@hvacpro.com.br / admin#1234')
  console.log('Client credentials: cliente@exemplo.com / client123')
  console.log('Technician credentials: tecnico@exemplo.com / tech123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })