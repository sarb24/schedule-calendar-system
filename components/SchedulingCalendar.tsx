'use client'

import React, { useState, useEffect } from 'react'
import { Shift, User } from '@prisma/client'
import { BookingButton } from './BookingButton'
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getCalendarState, setCalendarState } from '@/lib/indexedDB'

interface SchedulingCalendarProps {
  shifts: Shift[]
  staff: User[]
  userType: 'SERVICE_USER' | 'STAFF' | 'ADMIN' | 'CONTRACTOR'
  userId: string
}

export const SchedulingCalendar: React.FC<SchedulingCalendarProps> = ({ shifts: initialShifts, staff, userType, userId }) => {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [shifts, setShifts] = useState(initialShifts)

  useEffect(() => {
    const loadSavedState = async () => {
      const savedState = await getCalendarState(`calendarState_${userId}`)
      if (savedState) {
        setShifts(savedState.shifts)
        setCurrentDate(new Date(savedState.currentDate))
        setView(savedState.view)
      }
    }
    loadSavedState()
  }, [userId])

  useEffect(() => {
    const saveState = async () => {
      await setCalendarState(`calendarState_${userId}`, {
        shifts,
        currentDate: currentDate.toISOString(),
        view,
      })
    }
    saveState()
  }, [shifts, currentDate, view, userId])

  const onBookShift = async (shiftId: number) => {
    try {
      const response = await fetch('/api/shifts/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftId, serviceUserId: userId }),
      })

      if (response.ok) {
        setShifts(prevShifts => 
          prevShifts.map(shift => 
            shift.id === shiftId ? { ...shift, status: 'PENDING' } : shift
          )
        )
      }
    } catch (error) {
      console.error('Error booking shift:', error)
    }
  }

  const onConfirmShift = async (shiftId: number) => {
    try {
      const response = await fetch('/api/shifts/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftId, staffId: userId }),
      })

      if (response.ok) {
        setShifts(prevShifts => 
          prevShifts.map(shift => 
            shift.id === shiftId ? { ...shift, status: 'BOOKED', staffId: parseInt(userId) } : shift
          )
        )
      }
    } catch (error) {
      console.error('Error confirming shift:', error)
    }
  }

  const updateShiftTimes = async (shiftId: number, startTime: string, endTime: string) => {
    try {
      const response = await fetch('/api/shifts/update-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftId, startTime, endTime }),
      })

      if (response.ok) {
        setShifts(prevShifts => 
          prevShifts.map(shift => 
            shift.id === shiftId ? { ...shift, startTime, endTime } : shift
          )
        )
      }
    } catch (error) {
      console.error('Error updating shift times:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getWeekDates = (date: Date) => {
    const week = []
    const firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay()))
    for (let i = 0; i < 7; i++) {
      week.push(new Date(firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (i === 0 ? 0 : 1))))
    }
    return week
  }

  const getShiftColor = (shiftType: string) => {
    switch (shiftType) {
      case 'MORNING':
        return 'bg-yellow-200'
      case 'AFTERNOON':
        return 'bg-green-200'
      case 'NIGHT':
        return 'bg-blue-200'
      default:
        return 'bg-gray-200'
    }
  }

  const renderShift = (shift: Shift) => {
    const staffMember = staff.find(s => s.id === shift.staffId)
    const bookingCount = shift.bookings ? shift.bookings.length : 0
    return (
      <div
        key={shift.id}
        className={`p-1 mb-1 text-sm rounded ${getShiftColor(shift.type)}`}
        title={shift.status === 'BOOKED' ? `Booked by: ${shift.bookings[0]?.serviceUser.name}, Address: ${shift.bookings[0]?.serviceUser.address}` : ''}
        role="button"
        tabIndex={0}
        aria-label={`${shift.type} shift from ${shift.startTime} to ${shift.endTime}, ${shift.status}`}
      >
        <div>{shift.type} ({shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)})</div>
        <div>{staffMember?.name || 'Unassigned'}</div>
        {userType === 'SERVICE_USER' && (
          <BookingButton
            shiftId={shift.id}
            serviceUserId={parseInt(userId)}
            initialStatus={shift.status}
          />
        )}
        {shift.status === 'BOOKED' && `Booked (${bookingCount})`}
      </div>
    )
  }

  const renderDay = (date: Date) => {
    const dayShifts = shifts.filter(
      shift => new Date(shift.date).toDateString() === date.toDateString()
    )
    return (
      <div key={date.toISOString()} className="border p-2">
        <div className="font-bold">{date.getDate()}</div>
        {dayShifts.map(renderShift)}
        {userType === 'ADMIN' && (
          <Button
            onClick={() => {
              const newShift: Shift = {
                id: Math.random(),
                date: date.toISOString(),
                type: 'MORNING',
                startTime: '09:00',
                endTime: '17:00',
                staffId: null,
                status: 'AVAILABLE',
                bookings: [],
              }
              setShifts([...shifts, newShift])
            }}
            className="mt-2"
          >
            Add Shift
          </Button>
        )}
      </div>
    )
  }

  const renderWeeklyView = () => {
    const weekDates = getWeekDates(currentDate)
    return (
      <div className="grid grid-cols-8 gap-2">
        <div className="font-bold">Staff</div>
        {weekDates.map(date => (
          <div key={date.toISOString()} className="font-bold text-center">
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
          </div>
        ))}
        {staff.map(staffMember => (
          <React.Fragment key={staffMember.id}>
            <div className="font-semibold">{staffMember.name}</div>
            {weekDates.map(date => (
              <div key={`${staffMember.id}-${date.toISOString()}`} className="border p-2">
                {renderDay(date)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    )
  }

  const renderMonthlyView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const startingDay = firstDayOfMonth.getDay()
    const calendarDays = []

    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="border p-2"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      calendarDays.push(renderDay(date))
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-bold text-center">{day}</div>
        ))}
        {calendarDays}
      </div>
    )
  }

  const calculateSummary = () => {
    const totalShifts = shifts.length
    const availableShifts = shifts.filter(s => s.status === 'AVAILABLE').length
    const bookedShifts = shifts.filter(s => s.status === 'BOOKED').length
    const pendingShifts = shifts.filter(s => s.status === 'PENDING').length

    return { totalShifts, availableShifts, bookedShifts, pendingShifts }
  }

  return (
    <div className="scheduling-calendar">
      <div className="calendar-header flex justify-between items-center mb-4">
        <Button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
          Previous
        </Button>
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <Button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
          Next
        </Button>
        <Select value={view} onValueChange={(value) => setView(value as 'weekly' | 'monthly')}>
          <Select.Trigger>
            <Select.Value placeholder="Select view" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="weekly">Weekly</Select.Item>
            <Select.Item value="monthly">Monthly</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className="calendar-body">
        {view === 'weekly' ? renderWeeklyView() : renderMonthlyView()}
      </div>
      <div className="calendar-footer mt-4">
        <div>Total Shifts: {calculateSummary().totalShifts}</div>
        <div>Available Shifts: {calculateSummary().availableShifts}</div>
        <div>Booked Shifts: {calculateSummary().bookedShifts}</div>
        <div>Pending Shifts: {calculateSummary().pendingShifts}</div>
      </div>
    </div>
  )
}

