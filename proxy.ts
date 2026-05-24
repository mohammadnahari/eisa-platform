import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { ProfileRow } from '@/lib/types/database.types'
import { getSupabaseConfig } from './lib/supabase/config'

const PUBLIC_EXACT = new Set([
  '/',
  '/login',
  '/verify',
  '/forgot-password',
  '/reset-password',
])

const PUBLIC_PREFIX = [
  '/api/auth',
  '/api/stripe/webhook',
  '/_next/',
  '/favicon',
  '/static/',
]

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true
  return PUBLIC_PREFIX.some((p) => pathname.startsWith(p))
}

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  coach: '/coach',
  client: '/client',
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // Critical: never run Supabase/session checks for public pages.
  // This prevents public pages from crashing if env/session/auth has a runtime issue.
  if (isPublic(pathname)) {
    return response
  }

  const { supabaseUrl, supabaseKey } = getSupabaseConfig()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  const { data } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  const profile = data as Pick<ProfileRow, 'role' | 'is_active'> | null

  if (!profile || profile.is_active === false) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?reason=suspended', request.url))
  }

  const role = profile.role

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/', request.url))
  }

  if (pathname.startsWith('/coach') && role !== 'coach') {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/', request.url))
  }

  if (pathname.startsWith('/client') && role !== 'client') {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
