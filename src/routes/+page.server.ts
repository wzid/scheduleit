import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { events } from '$lib/db/schema';

const schema = z.object({
  name: z.string().trim().min(1, 'Please enter an event name.'),
  fromTime: z.string(),
  toTime: z.string(),
  timeZone: z.string(),
  customId: z.string(),
  dates: z.array(z.string()).min(1, 'Please select at least one date.')
});

export const load = async () => {
  const form = await superValidate(schema);
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);
    if (!form.valid) {
      return fail(400, { form });
    }
    const result = await db.insert(events).values(form.data).returning({ id: events.id });
    return { form, eventId: result[0].id };
  }
};
