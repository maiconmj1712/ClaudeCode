import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Panexa — Saúde Ocupacional para Empresas',
    template: '%s | Panexa',
  },
  description: 'A plataforma de saúde ocupacional que distribui benefícios de saúde para empresas via clínicas parceiras. Telemedicina, saúde mental NR-1, odontologia e muito mais.',
  keywords: ['saúde ocupacional', 'telemedicina', 'NR-1', 'benefícios empresariais', 'saúde mental'],
  authors: [{ name: 'Panexa' }],
  creator: 'Panexa',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Panexa',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: 'rounded-xl shadow-lg',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
