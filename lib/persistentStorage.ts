import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function saveCalendarState(userId: number, calendarState: any) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      calendarState: JSON.stringify(calendarState),
    },
  })
}

export async function loadCalendarState(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { calendarState: true },
  })

  return user?.calendarState ? JSON.parse(user.calendarState) : null
}

