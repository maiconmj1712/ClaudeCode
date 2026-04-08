'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard, Building2, Package, DollarSign, Settings,
  Users, BarChart3, Link2, CreditCard, Trophy, Star,
  UserCheck, Bell, LogOut, Heart, Stethoscope, X, Menu,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const PANEXA_NAV: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Clínicas',    href: '/admin/clinicas',       icon: <Building2 className="h-4 w-4" /> },
      { label: 'Produtos',    href: '/admin/produtos',        icon: <Package className="h-4 w-4" /> },
      { label: 'Financeiro',  href: '/admin/financeiro',      icon: <DollarSign className="h-4 w-4" /> },
      { label: 'Relatórios',  href: '/admin/relatorios',      icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Plataforma',
    items: [
      { label: 'Automações',    href: '/admin/automacoes',     icon: <Bell className="h-4 w-4" /> },
      { label: 'Configurações', href: '/admin/configuracoes',  icon: <Settings className="h-4 w-4" /> },
    ],
  },
]

const CLINICA_NAV: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/clinica/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Negócio',
    items: [
      { label: 'Minha URL',         href: '/clinica/minha-url', icon: <Link2 className="h-4 w-4" /> },
      { label: 'Vendas & Comissões', href: '/clinica/vendas',   icon: <DollarSign className="h-4 w-4" /> },
      { label: 'Clientes',          href: '/clinica/clientes',  icon: <Building2 className="h-4 w-4" /> },
      { label: 'Créditos',          href: '/clinica/creditos',  icon: <CreditCard className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Gamificação',
    items: [
      { label: 'Ranking', href: '/clinica/ranking', icon: <Trophy className="h-4 w-4" /> },
      { label: 'Badges',  href: '/clinica/badges',  icon: <Star className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Conta',
    items: [
      { label: 'Configurações', href: '/clinica/configuracoes', icon: <Settings className="h-4 w-4" /> },
    ],
  },
]

const EMPRESA_NAV: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/empresa/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Colaboradores', href: '/empresa/colaboradores', icon: <Users className="h-4 w-4" /> },
      { label: 'Benefícios',    href: '/empresa/beneficios',    icon: <Heart className="h-4 w-4" /> },
      { label: 'Financeiro',    href: '/empresa/financeiro',    icon: <DollarSign className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Conta',
    items: [
      { label: 'Configurações', href: '/empresa/configuracoes', icon: <Settings className="h-4 w-4" /> },
    ],
  },
]

const COLABORADOR_NAV: NavGroup[] = [
  {
    items: [
      { label: 'Meus Benefícios', href: '/beneficios/home',        icon: <Heart className="h-4 w-4" /> },
      { label: 'Telemedicina',    href: '/beneficios/telemedicina', icon: <Stethoscope className="h-4 w-4" /> },
      { label: 'Meu Perfil',      href: '/beneficios/perfil',       icon: <UserCheck className="h-4 w-4" /> },
    ],
  },
]

interface SidebarProps {
  role: 'ADMIN_PANEXA' | 'ADMIN_CLINICA' | 'ADMIN_EMPRESA' | 'COLABORADOR'
  logo?: string
  brandName?: string
}

export function Sidebar({ role, brandName = 'Panexa' }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navGroups =
    role === 'ADMIN_PANEXA'  ? PANEXA_NAV  :
    role === 'ADMIN_CLINICA' ? CLINICA_NAV :
    role === 'ADMIN_EMPRESA' ? EMPRESA_NAV :
    COLABORADOR_NAV

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[#021f26] font-black text-lg flex-shrink-0">
          P
        </div>
        <span className="font-bold text-white text-lg tracking-tight">{brandName}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-[0.12em] mb-1.5 px-3">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'sidebar-nav-item group',
                        isActive && 'active'
                      )}
                    >
                      {/* Active indicator dot */}
                      <span className={cn(
                        'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full transition-all duration-200',
                        isActive ? 'bg-primary opacity-100' : 'opacity-0'
                      )} />
                      <span className={cn(
                        'flex-shrink-0 transition-colors duration-150',
                        isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
                      )}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-[13px]">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-sidebar-accent transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
            {getInitials(session?.user?.name || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-sidebar-foreground truncate">
              {session?.user?.name || 'Usuário'}
            </p>
            <p className="text-[11px] text-sidebar-foreground/40 truncate">
              {session?.user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar h-screen sticky top-0 overflow-hidden flex-shrink-0 relative">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-64 bg-sidebar z-50 animate-slide-in-right shadow-2xl relative">
            <button
              className="absolute top-4 right-3 p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
