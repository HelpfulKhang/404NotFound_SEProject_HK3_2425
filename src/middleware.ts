import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Skip middleware for auth callback routes
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  // Refresh session if expired - required for Server Components
  // Note: For email/password sign-in, sessions are stored in localStorage on the client,
  // so server-side middleware cannot reliably determine auth state. Avoid redirects here.
  try {
    await supabase.auth.getSession()
  } catch (_) {
    // ignore
  }

  // Do not perform server-side redirects based on session here to avoid false negatives.
  // Client pages/components already handle auth gating and redirects.
  return res
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    // - auth callback routes
    '/((?!_next/static|_next/image|favicon.ico|public/|auth/callback).*)',
  ],
}
