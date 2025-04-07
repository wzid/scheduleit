import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { events, users } from '$lib/db/schema';
import { and, eq, isNotNull, SQL } from 'drizzle-orm';
import { z } from 'zod';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { hash } from 'argon2';

const addUserSchema = z.object({
  eventId: z.string(),
  name: z.string().trim().min(1, { message: 'Name cannot be empty' }).max(25, { message: 'Name cannot be longer than 32 characters' }),
  password: z.string().trim()
});

export async function load({ params }: { params: { slug: string } }) {
  const addUserForm = await superValidate(zod(addUserSchema));
  const result = await db.select().from(events).where(eq(events.id, params.slug));

  if (!result || result.length === 0 || !result[0]) {
    throw error(404, `Could not find event with id ${params.slug}`);
  }

  const eventUsers = await db
    .select({
      id: users.id,
      name: users.name,
      availability: users.availability,
      hasPassword: isNotNull(users.password) as SQL<0 | 1>
    })
    .from(users)
    .where(eq(users.eventId, params.slug));

  return { addUserForm, event: result[0], users: eventUsers };
}

export const actions = {
  addUser: async ({ request }: { request: Request }) => {
    const form = await superValidate(request, zod(addUserSchema));
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

    return {
      form,
      user: {
        name,
        id: result[0].id,
        hasPassword: hashedPassword === null ? 0 : 1
      }
    };
  }
};
