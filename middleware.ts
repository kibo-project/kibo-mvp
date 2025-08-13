import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // TODO: Implement your authentication logic here  
  const token = true || request.cookies.get('auth-token')?.value || request.headers.get('authorization')

  if (request.nextUrl.pathname.startsWith('/api/orders')) {

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}