import { PrismaClient } from '@prisma/client'
import { UserPermissions } from '@/components/UserPermissions'

const prisma = new PrismaClient()

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    include: { permissions: true },
  })

  return (
    <div className="admin-panel p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <div className="user-list space-y-6">
        {users.map(user => (
          <UserPermissions key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}

