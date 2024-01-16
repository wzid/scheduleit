import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { events } from '$lib/db/schema';

const schema = z.object({
  id: z.string().trim(),
  name: z.string().trim().min(1, 'Please enter an event name.'),
  dateType: z.enum(['specific', 'days_of_week']),
  timeZone: z.string(),
  startTime: z.number().int().positive(),
  endTime: z.number().int().positive(),
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

    const { id: rawId, ...data } = form.data;

    const result = await db
      .insert(events)
      .values({ id: rawId === '' ? undefined : rawId, ...data })
      .returning({ id: events.id });

    return { form, eventId: result[0].id };
  }
};
