import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

function createRedisClient() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export const redis = createRedisClient()

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
    })
  : null

export const checkoutRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "ratelimit:checkout",
      analytics: true,
    })
  : null

export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T> {
  if (!redis) return fetcher()

  const cached = await redis.get<T>(key)
  if (cached) return cached

  const data = await fetcher()
  await redis.set(key, JSON.stringify(data), { ex: ttl })
  return data
}

export async function invalidateCache(pattern: string) {
  if (!redis) return

  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await Promise.all(keys.map((key) => redis!.del(key)))
  }
}
