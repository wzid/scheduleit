import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { events, users } from '$lib/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { hash } from 'argon2';

const addUserSchema = z.object({
  eventId: z.string(),
  name: z.string().trim().min(1, { message: 'Name cannot be empty' }),
  password: z.string().trim()
});

export async function load({ params }) {
  const addUserForm = await superValidate(addUserSchema);
  const result = await db.select().from(events).where(eq(events.id, params.slug));

  if (!result || result.length === 0 || !result[0]) {
    throw error(404, `Could not find event with id ${params.slug}`);
  }

  const eventUsers = await db
    .select({
      id: users.id,
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

    const { eventId, name, password } = form.data;
    const hashedPassword = password.length ? await hash(password) : null;

    const existingUser = await db.query.users.findFirst({
      where: and(eq(users.eventId, eventId), eq(users.name, name))
    });
    if (existingUser) {
      return setError(form, 'name', 'This user already exists!');
    }

    const result = await db
      .insert(users)
      .values({ eventId, name, password: hashedPassword })
      .returning({ id: users.id })
      .execute();

    return { form, user: { id: result[0].id, name } };
  }
};
