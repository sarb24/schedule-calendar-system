import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URL
})

client.on('error', (err) => console.log('Redis Client Error', err))

await client.connect()

export async function cacheData(key: string, data: any, expireTime = 3600) {
  await client.set(key, JSON.stringify(data), {
    EX: expireTime
  })
}

export async function getCachedData(key: string) {
  const data = await client.get(key)
  return data ? JSON.parse(data) : null
}

