import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { PrismaClient } from '@prisma/client'
import { SchedulingCalendar } from '@/components/SchedulingCalendar'
import { AdminPanel } from '@/components/AdminPanel'
import { StaffDashboard } from '@/components/StaffDashboard'
import { cacheData, getCachedData } from '@/lib/redis'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { permissions: true }
  })

  let shifts = await getCachedData('shifts')
  if (!shifts) {
    shifts = await prisma.shift.findMany({
      include: { staff: true, bookings: true },
      where: {
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: 'asc',
      },
    })
    await cacheData('shifts', shifts, 300) // Cache for 5 minutes
  }

  let staff = await getCachedData('staff')
  if (!staff) {
    staff = await prisma.user.findMany({
      where: { userType: 'STAFF' },
    })
    await cacheData('staff', staff, 3600) // Cache for 1 hour
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      {user.userType === 'ADMIN' && <AdminPanel users={await prisma.user.findMany({ include: { permissions: true } })} />}
      {user.userType === 'STAFF' && <StaffDashboard staffId={user.id} />}
      <SchedulingCalendar 
        shifts={shifts} 
        staff={staff} 
        onBookShift={(shiftId) => {}} 
        userType={user.userType}
        userId={user.id.toString()}
      />
    </div>
  )
}

