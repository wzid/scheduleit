import type { Day } from '$lib/constants';
import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

type DateType = 'dates' | 'days';

export const events = sqliteTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(8)),
  name: text('name').notNull(),
  dateType: text('date_type').$type<DateType>().notNull(),
  timeZone: text('time_zone').notNull(),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  dates: text('dates', { mode: 'json' }).$type<string[]>(),
  days: text('days', { mode: 'json' }).$type<Day[]>(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(cast (unixepoch() as int))`)
});

export const eventRelations = relations(events, ({ many }) => ({
  users: many(users)
}));

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(8)),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id),
  name: text('name').notNull(),
  password: text('password'),
  availability: text('availability').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(cast (unixepoch() as int))`)
});

export const userRelations = relations(users, ({ one }) => ({
  event: one(events, {
    fields: [users.eventId],
    references: [events.id]
  })
}));
