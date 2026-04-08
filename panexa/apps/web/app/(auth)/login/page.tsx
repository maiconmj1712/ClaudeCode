'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getRedirectByRole } from '@/lib/auth'
import type { Role } from '@panexa/shared-types'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

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

    // Fetch session to get role and redirect
    const sessionRes = await fetch('/api/auth/session')
    const session = await sessionRes.json()
    const role = session?.user?.role as Role
    router.push(getRedirectByRole(role))
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-sidebar p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-black text-xl">P</div>
          <span className="font-bold text-white text-xl">Panexa</span>
        </div>

        <div>
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Saúde Ocupacional<br />que gera receita.
          </h1>
          <p className="mt-4 text-sidebar-foreground/60 text-lg leading-relaxed">
            Distribua benefícios de saúde para empresas da sua carteira e ganhe 30% de comissão automática — sem esforço adicional.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: 'Clínicas parceiras', value: '200+' },
              { label: 'Empresas atendidas', value: '1.800+' },
              { label: 'Colaboradores', value: '45k+' },
              { label: 'Comissão automática', value: '30%' },
            ].map(s => (
              <div key={s.label} className="bg-sidebar-accent rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-sidebar-foreground/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-sidebar-foreground/30">
          © 2026 Panexa. Todos os direitos reservados.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-black text-lg">P</div>
            <span className="font-bold text-foreground text-lg">Panexa</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground text-sm mt-1">Entre com suas credenciais para acessar o painel</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">E-mail</label>
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
                <label className="text-sm font-medium text-foreground">Senha</label>
                <a href="/esqueci-senha" className="text-xs text-primary hover:underline">
                  Esqueci a senha
                </a>
              </div>
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="hover:text-foreground transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
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

          {/* Demo credentials hint */}
          <div className="mt-8 rounded-xl bg-muted/50 border border-border p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Acesso Demo</p>
            <p>admin@panexa.com.br · Panexa@2024</p>
          </div>
        </div>
      </div>
    </div>
  )
}
