'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, Stethoscope, TrendingUp, Users, Building2, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getRedirectByRole } from '@/lib/auth'
import type { Role } from '@panexa/shared-types'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

const stats = [
  { label: 'Clínicas parceiras',    value: '200+',  icon: Stethoscope },
  { label: 'Empresas atendidas',    value: '1.800+', icon: Building2 },
  { label: 'Colaboradores',         value: '45k+',  icon: Users },
  { label: 'Comissão automática',   value: '30%',   icon: Percent },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (!res?.ok || res.error) {
      toast.error('E-mail ou senha incorretos')
      return
    }

    const sessionRes = await fetch('/api/auth/session')
    const session = await sessionRes.json()
    const role = session?.user?.role as Role
    router.push(getRedirectByRole(role))
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-[#021f26] p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[#021f26] font-black text-xl">
            P
          </div>
          <span className="font-bold text-white text-xl tracking-tight">Panexa</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20">
            <Stethoscope className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Saúde Ocupacional<br />
            <span className="text-primary">que gera receita.</span>
          </h1>
          <p className="mt-4 text-white/50 text-base leading-relaxed max-w-sm">
            Distribua benefícios de saúde para empresas da sua carteira e ganhe comissão automática — sem esforço adicional.
          </p>

          {/* Stats grid */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-[1rem] p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="text-xs text-white/40 font-medium">{label}</p>
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/20 relative z-10">
          © 2026 Panexa. Todos os direitos reservados.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[#021f26] font-black text-lg">P</div>
            <span className="font-bold text-foreground text-lg">Panexa</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com.br"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-foreground">Senha</label>
                <a href="/esqueci-senha" className="text-xs text-primary font-medium hover:underline">
                  Esqueci a senha
                </a>
              </div>
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar na plataforma'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sua clínica ainda não é parceira?{' '}
              <a href="/#planos" className="text-primary font-semibold hover:underline">
                Seja parceira
              </a>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 rounded-[10px] bg-card border border-border p-4 text-xs text-muted-foreground shadow-card">
            <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Acesso Demo
            </p>
            <p className="font-mono">admin@panexa.com.br</p>
            <p className="font-mono">Panexa@2024</p>
          </div>
        </div>
      </div>
    </div>
  )
}
