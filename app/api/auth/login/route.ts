import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, userType: user.userType },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  )

  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, userType: user.userType } })
}

