import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { ipAddress } from '@vercel/functions';

export const RATE_LIMIT_ERROR = 'You are being rate limited! Please try again later.';

export const limiters = {
  createEvent: Ratelimit.slidingWindow(3, '1 m'),
  recordAvailability: Ratelimit.slidingWindow(10, '1 m'),
  addUser: Ratelimit.slidingWindow(5, '1 m'),
  login: Ratelimit.slidingWindow(5, '1 m')
};

type Algorithm = (typeof limiters)[keyof typeof limiters];

export async function isRateLimited(algorithm: Algorithm, request: Request, identifier: string) {
  const ip = ipAddress(request) ?? '127.0.0.1';
  const key = `${ip}:${identifier}`;

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: algorithm,
    analytics: true
  });

  try {
    const { success } = await limiter.limit(key);
    return !success;
  } catch (error) {
    console.error(`Failed to check rate limit for key \`${key}\``, error);
    return false;
  }
}
