import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { events, users } from '$lib/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { setError, superValidate } from 'sveltekit-superforms/server';

const addUserSchema = z.object({
  eventId: z.string(),
  name: z.string().trim().min(1)
});

export async function load({ params }) {
  const addUserForm = await superValidate(addUserSchema);
  const result = await db.select().from(events).where(eq(events.id, params.slug));

  if (!result || result.length === 0 || !result[0]) {
    throw error(404, `Could not find event with id ${params.slug}`);
  }

  const eventUsers = await db
    .select({
      name: users.name,
      availability: users.availability
    })
    .from(users)
    .where(eq(users.eventId, params.slug));

  return { addUserForm, event: result[0], users: eventUsers };
}

export const actions = {
  addUser: async ({ request }) => {
    const form = await superValidate(request, addUserSchema);
    if (!form.valid) {
      return fail(400, { form });
    }

    const { eventId, name } = form.data;

    const existingUser = await db.query.users.findFirst({
      where: and(eq(users.eventId, eventId), eq(users.name, name))
    });
    if (existingUser) {
      return setError(form, 'name', 'This user already exists!');
    }

    await db.insert(users).values({ eventId, name });
    return { form };
  }
};
