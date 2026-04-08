import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/shared/sidebar'

export default async function AdminClinicaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN_CLINICA') redirect('/login')

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar role="ADMIN_CLINICA" />
      <main className="flex-1 overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  )
}
