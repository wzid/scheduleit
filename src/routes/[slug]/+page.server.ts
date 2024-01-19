import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { events, users } from '$lib/db/schema.js';
import { eq } from 'drizzle-orm';

export async function load({ params }) {
  const result = await db.select().from(events).where(eq(events.id, params.slug));
  
  if (!result || result.length === 0 || !result[0]) {
    throw error(404, `Could not find event with id ${params.slug}`);
  }

  const eventUsers = await db.select().from(users).where(eq(users.eventId, params.slug));

  return { event: result[0], users: eventUsers };
}
