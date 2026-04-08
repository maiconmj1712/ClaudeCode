import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/shared/sidebar'

export default async function AdminPanexaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN_PANEXA') redirect('/login')

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar role="ADMIN_PANEXA" />
      <main className="flex-1 overflow-x-hidden">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  )
}
