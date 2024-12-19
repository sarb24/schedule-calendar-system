import { getCalendarState, setCalendarState } from './indexedDB'

export async function syncDataWithServer(userId: string) {
  try {
    const localState = await getCalendarState(`calendarState_${userId}`)
    
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, localState }),
    })

    if (response.ok) {
      const serverState = await response.json()
      await setCalendarState(`calendarState_${userId}`, serverState)
    }
  } catch (error) {
    console.error('Error syncing data:', error)
  }
}

