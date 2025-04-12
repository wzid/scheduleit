import { json, type RequestHandler } from '@sveltejs/kit';
import { isAuthenticated } from '../utils';
import { isRateLimited, RATE_LIMIT_ERROR } from '$lib/ratelimit';
import { limiters } from '$lib/ratelimit';

export const POST: RequestHandler = async ({ request }) => {
  const { userId, password } = await request.json();

  if (!userId) {
    return json(
      {
        success: false,
        error: 'Invalid parameters'
      },
      { status: 400 }
    );
  }

  if (await isRateLimited(limiters.login, request, 'login')) {
    return json(
      {
        success: false,
        error: RATE_LIMIT_ERROR
      },
      { status: 429 }
    );
  }

  if (!(await isAuthenticated(userId, password))) {
    return json(
      {
        success: false,
        error: 'Invalid user ID or password'
      },
      { status: 401 }
    );
  }

  return json({ success: true });
};
