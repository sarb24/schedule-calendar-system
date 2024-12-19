'use client'

import { useState, useEffect } from 'react'
import { User, Permission, PermissionType } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AdminPanelProps {
  users: (User & { permissions: Permission[] })[]
}

export function AdminPanel({ users: initialUsers }: AdminPanelProps) {
  const [users, setUsers] = useState(initialUsers)

  const updatePermission = async (userId: number, permissionType: PermissionType, isGranted: boolean) => {
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, permissionType, isGranted }),
      })

      if (response.ok) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId
              ? {
                  ...user,
                  permissions: user.permissions.map(p => 
                    p.permissionType === permissionType ? { ...p, isGranted } : p
                  )
                }
              : user
          )
        )
      } else {
        console.error('Failed to update permission')
      }
    } catch (error) {
      console.error('Error updating permission:', error)
    }
  }

  return (
    <div className="admin-panel">
      <h2 className="text-2xl font-bold mb-4">User Permissions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>User Type</TableHead>
            {Object.values(PermissionType).map(type => (
              <TableHead key={type}>{type}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.userType}</TableCell>
              {Object.values(PermissionType).map(type => (
                <TableCell key={type}>
                  <Checkbox
                    checked={user.permissions.find(p => p.permissionType === type)?.isGranted || false}
                    onCheckedChange={(checked) => updatePermission(user.id, type, checked as boolean)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

