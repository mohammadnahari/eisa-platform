import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // TODO: Implement Google OAuth callback
  // 1. Exchange code for tokens
  // 2. Encrypt tokens with MASTER_ENCRYPTION_KEY
  // 3. Store in connected_accounts table
  // 4. Redirect to /coach/settings/connections
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  console.log('Google OAuth callback, code received:', !!code)
  return NextResponse.redirect(new URL('/coach/settings/connections', request.url))
}
