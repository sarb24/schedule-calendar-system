import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  vus: 10,
  duration: '30s',
}

export default function () {
  const url = 'http://localhost:3000/api/shifts/book'
  const payload = JSON.stringify({
    shiftId: 1,
    serviceUserId: 1,
  })

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const res = http.post(url, payload, params)

  check(res, {
    'status is 200': (r) => r.status === 200,
    'transaction time OK': (r) => r.timings.duration < 200,
  })

  sleep(1)
}

