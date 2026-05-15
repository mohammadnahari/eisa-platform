import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  coach: '/coach',
  client: '/client',
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicPath =
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/verify') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/api/auth')

  if (isPublicPath) {
    if (pathname === '/login' && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        return NextResponse.redirect(new URL(ROLE_HOME[profile.role] ?? '/', request.url))
      }
    }

    return response
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, mfa_enabled')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    return NextResponse.redirect(new URL('/login?reason=suspended', request.url))
  }

  const { role } = profile

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}