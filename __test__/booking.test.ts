import { POST as bookShift } from '@/app/api/shifts/book/route'
import prisma from '@/lib/prisma'
import { sendNotifications } from '@/lib/notifications'

jest.mock('@/lib/prisma')
jest.mock('@/lib/notifications')

describe('Shift Booking', () => {
  it('should book an available shift', async () => {
    const mockShift = {
      id: 1,
      status: 'AVAILABLE',
      date: new Date(),
      type: 'MORNING',
    }

    prisma.shift.findUnique.mockResolvedValue(mockShift)
    prisma.booking.create.mockResolvedValue({ id: 1 })
    prisma.shift.update.mockResolvedValue({ ...mockShift, status: 'PENDING' })
    prisma.user.findMany.mockResolvedValue([{ id: 1, email: 'staff@example.com' }])

    const request = new Request('http://localhost:3000/api/shifts/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId: 1, serviceUserId: 1 }),
    })

    const response = await bookShift(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('booking')
    expect(sendNotifications).toHaveBeenCalled()
  })

  it('should not book an unavailable shift', async () => {
    const mockShift = {
      id: 1,
      status: 'BOOKED',
      date: new Date(),
      type: 'MORNING',
    }

    prisma.shift.findUnique.mockResolvedValue(mockShift)

    const request = new Request('http://localhost:3000/api/shifts/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId: 1, serviceUserId: 1 }),
    })

    const response = await bookShift(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error', 'Shift not available')
  })

  it('should handle non-existent shifts', async () => {
    prisma.shift.findUnique.mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/shifts/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId: 999, serviceUserId: 1 }),
    })

    const response = await bookShift(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toHaveProperty('error', 'Shift not found')
  })
})

