import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export const events = sqliteTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(6)),
  name: text('name').notNull(),
  fromTime: text('from_time').notNull(),
  toTime: text('to_time').notNull(),
  timeZone: text('time_zone').notNull(),
  dates: text('dates', { mode: 'json' }).$type<string[]>().notNull(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(cast (unixepoch() as int))`)
});

export const eventRelations = relations(events, ({ many }) => ({
  availabilities: many(availabilities)
}));

// TODO: Finish writing the schema for a group member availability table
export const availabilities = sqliteTable('availabilities', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(6)),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id),
  // Add stuff here
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(cast (unixepoch() as int))`)
});

export const availabilityRelations = relations(availabilities, ({ one }) => ({
  event: one(events, {
    fields: [availabilities.eventId],
    references: [events.id]
  })
}));
