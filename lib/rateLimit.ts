import { NextApiRequest, NextApiResponse } from 'next'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterMemory({
  points: 5, // Number of points
  duration: 1, // Per second
})

export default async function rateLimit(req: NextApiRequest, res: NextApiResponse) {
  try {
    await rateLimiter.consume(req.socket.remoteAddress!)
  } catch {
    res.status(429).json({ message: 'Too Many Requests' })
    return false
  }
  return true
}

