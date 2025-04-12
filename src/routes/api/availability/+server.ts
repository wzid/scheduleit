import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { isAuthenticated } from '../utils';

export const POST: RequestHandler = async ({ request }) => {
  const { eventId, userId, availability, password } = await request.json();
  if (!eventId || !userId || !availability) {
    return json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  }
  if (!(await isAuthenticated(userId, password))) {
    return json({ success: false, error: 'Invalid user ID or password' }, { status: 401 });
  }
  await db
    .update(users)
    .set({ availability })
    .where(and(eq(users.eventId, eventId), eq(users.id, userId)));
  return json({ success: true });
};
