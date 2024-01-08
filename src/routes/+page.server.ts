import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/db/index.js';
import { events } from '$lib/db/schema.js';

const schema = z.object({
  name: z.string().trim().min(1, 'Please enter an event name.'),
  fromTime: z.string(),
  toTime: z.string(),
  timeZone: z.string(),
  dates: z.array(z.string()).min(1, 'Please select at least one date.')
});

export const load = async () => {
  const form = await superValidate(schema);
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);
    console.log('POST', form);

    if (!form.valid) {
      return fail(400, { form });
    }

    // 2024-01-07

    await db.insert(events).values(form.data);
    // TODO: Redirect user to the event page

    return { form };
  }
};
