import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { Role } from '@panexa/shared-types'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      email: string
      name: string
      role: Role
      clinicId?: string
      companyId?: string
      employeeId?: string
    }
  }
  interface User {
    id: string
    email: string
    name: string
    role: Role
    clinicId?: string
    companyId?: string
    employeeId?: string
    accessToken: string
    refreshToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    clinicId?: string
    companyId?: string
    employeeId?: string
    accessToken: string
    refreshToken: string
    accessTokenExpiry: number
  }
}

const API_URL = process.env.API_URL || 'http://localhost:3001'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null

          const data = await res.json()

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            clinicId: data.user.clinicId,
            companyId: data.user.companyId,
            employeeId: data.user.employeeId,
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
          }
        } catch {
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.clinicId = user.clinicId
        token.companyId = user.companyId
        token.employeeId = user.employeeId
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpiry = Date.now() + 3600 * 1000 // 1h
      }

      // Refresh token if expiring in <5min
      if (Date.now() < token.accessTokenExpiry - 5 * 60 * 1000) {
        return token
      }

      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        })

        if (!res.ok) throw new Error('Refresh failed')

        const data = await res.json()
        token.accessToken = data.accessToken
        token.accessTokenExpiry = Date.now() + 3600 * 1000
      } catch {
        // Force re-login
        token.accessToken = ''
      }

      return token
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        clinicId: token.clinicId,
        companyId: token.companyId,
        employeeId: token.employeeId,
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 3600, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
}

// Role-based redirect after login
export function getRedirectByRole(role: Role): string {
  switch (role) {
    case 'ADMIN_PANEXA':   return '/admin/dashboard'
    case 'ADMIN_CLINICA':  return '/clinica/dashboard'
    case 'ADMIN_EMPRESA':  return '/empresa/dashboard'
    case 'COLABORADOR':    return '/beneficios/home'
    default:               return '/login'
  }
}
