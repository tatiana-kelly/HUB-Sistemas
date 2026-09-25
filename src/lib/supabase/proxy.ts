import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAnonKey, supabaseUrl } from '@/lib/env'

/** Rotas acessíveis sem sessão. */
const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/auth/callback']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

/**
 * Renova a sessão em cada request e barra usuário não autenticado antes de
 * qualquer página renderizar. A checagem de ADMIN das rotas /admin é feita no
 * layout do servidor, onde o profile pode ser consultado com RLS.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, searchParams } = request.nextUrl

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirectTo', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Usuário autenticado não precisa mais da tela de login.
  if (user && (pathname === '/login' || pathname === '/forgot-password')) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = searchParams.get('redirectTo') ?? '/home'
    homeUrl.search = ''
    return NextResponse.redirect(homeUrl)
  }

  return response
}
