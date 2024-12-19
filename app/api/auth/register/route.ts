import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { email, password, userType, name, phone, address } = await request.json()

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userType,
        name,
        phone,
        address,
      },
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
  }
}

