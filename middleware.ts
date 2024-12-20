export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req) {
  // Get the token from the request headers
  const token = req.headers.get('authorization')?.substring(7)

  // If no token is provided, return 401
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    const user = payload as any

    // Set the user in the request context
    req.user = user

    // Continue to the next middleware or page
    return NextResponse.next()
  } catch (error) {
    // If the token is invalid, return 401
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
}

