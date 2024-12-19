'use client'

import { useState } from 'react'
import { User, Permission, PermissionType } from '@prisma/client'

interface UserPermissionsProps {
  user: User & { permissions: Permission[] }
}

export const UserPermissions: React.FC<UserPermissionsProps> = ({ user }) => {
  const [permissions, setPermissions] = useState(user.permissions)

  const updatePermission = async (permissionType: PermissionType, value: boolean) => {
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, permissionType, value }),
      })

      if (response.ok) {
        setPermissions(prev => 
          value 
            ? [...prev, { id: Date.now(), userId: user.id, permissionType }]
            : prev.filter(p => p.permissionType !== permissionType)
        )
      } else {
        console.error('Failed to update permission')
      }
    } catch (error) {
      console.error('Error updating permission:', error)
    }
  }

  return (
    <div className="user-permissions bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{user.name}</h2>
      <div className="permissions-list space-y-2">
        {Object.values(PermissionType).map(permissionType => (
          <div key={permissionType} className="flex items-center">
            <input
              type="checkbox"
              id={`${user.id}-${permissionType}`}
              checked={permissions.some(p => p.permissionType === permissionType)}
              onChange={(e) => updatePermission(permissionType, e.target.checked)}
              className="mr-2"
            />
            <label htmlFor={`${user.id}-${permissionType}`}>{permissionType}</label>
          </div>
        ))}
      </div>
    </div>
  )
}

