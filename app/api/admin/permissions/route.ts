import { NextResponse } from 'next/server'
import { PrismaClient, PermissionType } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { userId, permissionType, isGranted } = await request.json()

  try {
    const permission = await prisma.permission.upsert({
      where: {
        userId_permissionType: {
          userId,
          permissionType: permissionType as PermissionType,
        },
      },
      update: {
        isGranted,
      },
      create: {
        userId,
        permissionType: permissionType as PermissionType,
        isGranted,
      },
    })

    return NextResponse.json({ success: true, permission })
  } catch (error) {
    console.error('Error updating permission:', error)
    return NextResponse.json({ error: 'Error updating permission' }, { status: 500 })
  }
}

