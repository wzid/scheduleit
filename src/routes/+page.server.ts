import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/db';
import { events } from '$lib/db/schema';
import { DAY_ABBREVIATIONS, type DayAbbreviation } from '$lib/constants';
import { eq } from 'drizzle-orm';
import { fail } from 'sveltekit-superforms/client';

const schema = z
  .object({
    id: z.string().trim(),
    name: z.string().trim().min(1, 'Please enter an event name.'),
    dateType: z.enum(['dates', 'days']),
    timeZone: z.string(),
    startTime: z.number().int().nonnegative(),
    endTime: z.number().int().positive(),
    dates: z.array(z.string()),
    days: z.array(z.enum(DAY_ABBREVIATIONS as [DayAbbreviation]))
  })
  .refine((data) => data.dateType === 'days' || data.dates.length > 0, {
    message: 'Please select at least one date.'
  })
  .refine((data) => data.dateType === 'dates' || data.days.length > 0, {
    message: 'Please select at least one day.'
  });
export const load = async () => {
  const form = await superValidate(zod(schema));
  return { form };
};

export const actions = {
  default: async ({ request }: { request: Request }) => {
    const form = await superValidate(request, zod(schema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const { id: rawId, ...data } = form.data;
    const id = rawId === '' ? undefined : rawId;
    if (id) {
      const existingEvent = await db.query.events.findFirst({ where: eq(events.id, id) });
      if (existingEvent) {
        return fail(400, { form, error: 'That custom ID is already taken!' });
      }
    }

    if (data.dateType === 'days') {
      data.dates = [];
    } else {
      data.days = [];
    }

    const result = await db
      .insert(events)
      .values({ id, ...data })
      .returning({ id: events.id });

    return { form, eventId: result[0].id };
  }
};
