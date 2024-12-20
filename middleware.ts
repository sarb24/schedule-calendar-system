import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, JWTPayload } from 'jose'

export const runtime = 'experimental-edge'
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/contractor/:path*'],
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '')
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const user = payload as JWTPayload & { userType?: string }

    if (request.nextUrl.pathname.startsWith('/admin') && user.userType !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

