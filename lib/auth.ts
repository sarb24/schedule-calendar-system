import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

export function generateToken(user: User): string {
  return jwt.sign({ userId: user.id, userType: user.userType }, JWT_SECRET, { expiresIn: '1d' })
}

export function verifyToken(token: string): { userId: number; userType: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; userType: string }
    return decoded
  } catch (error) {
    throw new Error('Invalid token')
  }
}

