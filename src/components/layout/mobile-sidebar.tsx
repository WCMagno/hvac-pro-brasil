"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Users, 
  Wrench, 
  DollarSign, 
  Package, 
  FileText, 
  Receipt, 
  Settings,
  Thermometer,
  Building,
  AlertTriangle
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "Serviços", href: "/services", icon: Wrench },
  { name: "Financeiro", href: "/financial", icon: DollarSign },
  { name: "Estoque", href: "/inventory", icon: Package },
  { name: "Equipamentos", href: "/equipment", icon: Thermometer },
  { name: "PMOC", href: "/pmoc", icon: FileText },
  { name: "Recibos", href: "/receipts", icon: Receipt },
  { name: "Clientes", href: "/clients", icon: Building },
  { name: "Alertas", href: "/alerts", icon: AlertTriangle },
  { name: "Configurações", href: "/settings", icon: Settings },
]

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">HVAC Pro</h1>
              <p className="text-xs text-gray-500">Manutenção & PMOC</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>HVAC Maintenance System</p>
            <p>Lei nº 13.589/2018</p>
          </div>
        </div>
      </div>
    </div>
  )
}