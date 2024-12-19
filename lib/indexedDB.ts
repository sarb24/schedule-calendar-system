import { openDB, DBSchema } from 'idb'

interface CalendarDB extends DBSchema {
  calendarState: {
    key: string
    value: {
      shifts: any[]
      currentDate: string
      view: 'weekly' | 'monthly'
    }
  }
}

const dbPromise = openDB<CalendarDB>('calendar-db', 1, {
  upgrade(db) {
    db.createObjectStore('calendarState')
  },
})

export async function getCalendarState(key: string) {
  return (await dbPromise).get('calendarState', key)
}

export async function setCalendarState(key: string, val: any) {
  return (await dbPromise).put('calendarState', val, key)
}

