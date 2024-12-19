import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendNotifications } from '@/lib/notifications'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { shiftId, staffId } = await request.json()

  try {
    const shift = await prisma.shift.update({
      where: { id: shiftId },
      data: { 
        staffId,
        status: 'BOOKED'
      },
      include: { bookings: { include: { serviceUser: true } } }
    })

    if (shift.bookings[0]) {
      await sendNotifications(
        [shift.bookings[0].serviceUser],
        'EMAIL',
        `Your booking for ${shift.date} has been confirmed by staff.`
      )
    }

    // Cancel other pending bookings for this shift
    await prisma.booking.updateMany({
      where: { 
        shiftId,
        status: 'PENDING',
        NOT: { serviceUserId: shift.bookings[0].serviceUserId }
      },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({ success: true, shift })
  } catch (error) {
    console.error('Error confirming shift:', error)
    return NextResponse.json({ error: 'Error confirming shift' }, { status: 500 })
  }
}

