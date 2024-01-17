import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { events } from '$lib/db/schema.js';
import { eq } from 'drizzle-orm';

export async function load({ params }) {
  const result = await db.select().from(events).where(eq(events.id, params.slug));
  if (!result) {
    throw error(404, `Could not find event with id ${params.slug}`);
  }
  return { event: result[0] };
}
