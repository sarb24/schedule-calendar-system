'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

interface BookingButtonProps {
  shiftId: number
  serviceUserId: number
  initialStatus: 'AVAILABLE' | 'BOOKED' | 'PENDING'
  bookedCount: number
}

export const BookingButton: React.FC<BookingButtonProps> = ({ shiftId, serviceUserId, initialStatus, bookedCount }) => {
  const [status, setStatus] = useState(initialStatus)

  const handleAction = async () => {
    if (status === 'AVAILABLE') {
      try {
        const response = await fetch('/api/shifts/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shiftId, serviceUserId }),
        })

        if (response.ok) {
          setStatus('PENDING')
        } else {
          const error = await response.json()
          console.error('Booking failed:', error)
        }
      } catch (error) {
        console.error('Booking failed:', error)
      }
    } else if (status === 'BOOKED' || status === 'PENDING') {
      try {
        const response = await fetch('/api/shifts/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shiftId, serviceUserId }),
        })

        if (response.ok) {
          setStatus('AVAILABLE')
        } else {
          const error = await response.json()
          console.error('Cancellation failed:', error)
        }
      } catch (error) {
        console.error('Cancellation failed:', error)
      }
    }
  }

  return (
    <Button 
      onClick={handleAction} 
      variant={status === 'AVAILABLE' ? 'default' : 'secondary'}
    >
      {status === 'AVAILABLE' ? 'Book' : status === 'BOOKED' ? `Booked (${bookedCount})` : 'Add'}
    </Button>
  )
}

