import { db } from '$lib/db';
import { users } from '$lib/db/schema.js';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

// TODO: add password protection
export async function POST({ request }) {
  const { eventId, userName, availability } = await request.json();
  if (!eventId || !userName || !availability) {
    return json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  }
  await db
    .update(users)
    .set({ availability })
    .where(and(eq(users.eventId, eventId), eq(users.name, userName)));
  return json({ success: true });
}
