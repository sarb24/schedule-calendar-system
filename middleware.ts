import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const decoded = await verifyToken(token)
    const user = decoded.user

    if (request.nextUrl.pathname.startsWith('/admin') && user.userType !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/contractor') && user.userType !== 'CONTRACTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (user.userType === 'CONTRACTOR') {
      // Allow access only to available services and hired employees
      const allowedPaths = ['/contractor/services', '/contractor/employees']
      if (!allowedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/contractor/services', request.url))
      }
    }

    // Add more permission checks as needed

  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/contractor/:path*'],
}

