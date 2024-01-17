import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { events } from '$lib/db/schema';
import { DAYS_OF_THE_WEEK } from '$lib/constants';

const schema = z
  .object({
    id: z.string().trim(),
    name: z.string().trim().min(1, 'Please enter an event name.'),
    dateType: z.enum(['dates', 'days']),
    timeZone: z.string(),
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),
    dates: z.array(z.string()),
    days: z.array(z.enum(DAYS_OF_THE_WEEK))
  })
  .refine((data) => data.dateType === 'days' || data.dates.length > 0, {
    message: 'Please select at least one date.'
  })
  .refine((data) => data.dateType === 'dates' || data.days.length > 0, {
    message: 'Please select at least one day.'
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

    if (data.dateType === 'days') {
      data.dates = [];
    } else {
      data.days = [];
    }

    const result = await db
      .insert(events)
      .values({ id: rawId === '' ? undefined : rawId, ...data })
      .returning({ id: events.id });

    return { form, eventId: result[0].id };
  }
};
