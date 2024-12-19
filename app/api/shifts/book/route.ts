import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendNotifications } from '@/lib/notifications'
import { logger } from '@/lib/logger'
import rateLimit from '@/lib/rateLimit'
import { bookingSchema, sanitizeHtml } from '@/lib/validation'

export async function POST(request: Request) {
  if (!(await rateLimit(request, NextResponse))) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    const shift = await prisma.shift.findUnique({ 
      where: { id: validatedData.shiftId },
      include: { staff: true }
    })
    
    if (!shift) {
      logger.warn(`Attempt to book non-existent shift: ${validatedData.shiftId}`)
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    if (shift.status !== 'AVAILABLE') {
      logger.warn(`Attempt to book unavailable shift: ${validatedData.shiftId}`)
      return NextResponse.json({ error: 'Shift not available' }, { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: {
        shiftId: validatedData.shiftId,
        serviceUserId: validatedData.serviceUserId,
        status: 'PENDING',
      },
    })

    await prisma.shift.update({
      where: { id: validatedData.shiftId },
      data: { status: 'PENDING' },
    })

    const availableStaff = await prisma.user.findMany({
      where: { 
        userType: 'STAFF',
        shifts: { some: { date: shift.date, type: shift.type } }
      },
    })

    await sendNotifications(availableStaff, 'EMAIL', sanitizeHtml(`New booking request for ${shift.date}`))

    logger.info(`Shift ${validatedData.shiftId} booked successfully by user ${validatedData.serviceUserId}`)
    return NextResponse.json({ booking })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid input data:', error.errors)
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    logger.error('Error booking shift:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

