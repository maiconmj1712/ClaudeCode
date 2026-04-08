import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Heart, User, Home, LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function ColaboradorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.role !== 'COLABORADOR') redirect('/login')

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
      {/* Top header */}
      <header className="sticky top-0 z-30 bg-sidebar shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-black text-sm">P</div>
            <span className="font-bold text-white text-sm">Panexa Benefícios</span>
          </div>
          <div className="text-xs text-sidebar-foreground/50 truncate max-w-[160px]">
            {session.user.name}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-30">
        <div className="flex items-center justify-around max-w-lg mx-auto h-16">
          {[
            { href: '/beneficios/home', icon: <Home className="h-5 w-5" />, label: 'Início' },
            { href: '/beneficios/saude', icon: <Heart className="h-5 w-5" />, label: 'Saúde' },
            { href: '/beneficios/perfil', icon: <User className="h-5 w-5" />, label: 'Perfil' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors px-4"
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
