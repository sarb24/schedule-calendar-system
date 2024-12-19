'use client'

import { useState, useEffect } from 'react'
import { Shift, User } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface StaffDashboardProps {
  staffId: number
}

export function StaffDashboard({ staffId }: StaffDashboardProps) {
  const [pendingShifts, setPendingShifts] = useState<Shift[]>([])

  useEffect(() => {
    fetchPendingShifts()
  }, [staffId])

  const fetchPendingShifts = async () => {
    try {
      const response = await fetch(`/api/staff/${staffId}/pending-shifts`)
      if (response.ok) {
        const shifts = await response.json()
        setPendingShifts(shifts)
      }
    } catch (error) {
      console.error('Error fetching pending shifts:', error)
    }
  }

  const confirmShift = async (shiftId: number) => {
    try {
      const response = await fetch('/api/shifts/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftId, staffId }),
      })

      if (response.ok) {
        fetchPendingShifts()
      }
    } catch (error) {
      console.error('Error confirming shift:', error)
    }
  }

  return (
    <div className="staff-dashboard">
      <h2 className="text-2xl font-bold mb-4">Pending Shift Confirmations</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingShifts.map(shift => (
            <TableRow key={shift.id}>
              <TableCell>{new Date(shift.date).toLocaleDateString()}</TableCell>
              <TableCell>{shift.type}</TableCell>
              <TableCell>{shift.startTime}</TableCell>
              <TableCell>{shift.endTime}</TableCell>
              <TableCell>
                <Button onClick={() => confirmShift(shift.id)} className="bg-red-500 hover:bg-red-600 text-white">
                  Confirm Shift
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

