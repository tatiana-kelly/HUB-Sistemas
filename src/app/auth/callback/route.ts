import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Troca o código do link de e-mail (convite / recuperação de senha) por uma
 * sessão e encaminha o usuário para o destino interno solicitado.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next')
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/home'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?erro=link-invalido`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?erro=link-invalido`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
