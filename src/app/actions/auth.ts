'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { siteUrl } from '@/lib/env'

export interface ActionState {
  error?: string
  success?: string
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const redirectTo = String(formData.get('redirectTo') ?? '/home')

  if (!email || !password) {
    return { error: 'Informe e-mail e senha.' }
  }

  const supabase = await createClient()
  const { data: auth, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !auth.user) {
    // Mensagem genérica de propósito: não revela se o e-mail existe.
    return { error: 'E-mail ou senha inválidos.' }
  }

  // Filtra pelo próprio id: um ADMIN enxerga todos os profiles, e sem o filtro
  // a consulta traria várias linhas em vez do registro dele.
  const { data } = await supabase
    .from('profiles')
    .select('active')
    .eq('id', auth.user.id)
    .maybeSingle<{ active: boolean }>()

  if (data && !data.active) {
    await supabase.auth.signOut()
    return { error: 'Seu acesso está desativado. Procure o administrador do portal.' }
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo.startsWith('/') ? redirectTo : '/home')
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim()

  if (!email) return { error: 'Informe o e-mail cadastrado.' }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  })

  // Resposta sempre igual, para não revelar quais e-mails existem.
  return {
    success:
      'Se este e-mail estiver cadastrado, você receberá em instantes um link para redefinir a senha.',
  }
}

export async function updatePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (password.length < 8) return { error: 'A senha deve ter pelo menos 8 caracteres.' }
  if (password !== confirm) return { error: 'As senhas não conferem.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Link expirado. Solicite uma nova redefinição de senha.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'Não foi possível atualizar a senha. Tente novamente.' }

  revalidatePath('/', 'layout')
  redirect('/home?senha=atualizada')
}
