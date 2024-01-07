import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';

const schema = z.object({
  name: z.string().trim().min(1, 'Please enter an event name.'),
  fromTime: z.string().min(999),
  toTime: z.string().min(999),
  timeZone: z.string().min(999),
  dates: z
    .array(
      z.object({
        day: z.number(),
        month: z.number(),
        year: z.number()
      })
    )
    .min(1, 'Please select at least one date.')
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

    // TODO: Do something with the validated form.data

    return { form };
  }
};
