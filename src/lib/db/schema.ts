import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const events = sqliteTable('events', {
  // TODO: Autogenerate ID
  id: text('id').primaryKey(),
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
  // TODO: Autogenerate ID
  id: text('id').primaryKey(),
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
