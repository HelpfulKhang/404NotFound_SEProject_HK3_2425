import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const redirectUrl = new URL('/login', requestUrl.origin)
    redirectUrl.searchParams.set('error', error)
    redirectUrl.searchParams.set('error_description', errorDescription || 'Authentication failed')
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        const redirectUrl = new URL('/login', requestUrl.origin)
        redirectUrl.searchParams.set('error', 'session_exchange_failed')
        redirectUrl.searchParams.set('error_description', 'Failed to complete authentication')
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      const redirectUrl = new URL('/login', requestUrl.origin)
      redirectUrl.searchParams.set('error', 'unexpected_error')
      redirectUrl.searchParams.set('error_description', 'An unexpected error occurred')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
