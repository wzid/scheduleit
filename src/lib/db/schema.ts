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
  users: many(users)
}));

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(6)),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id),
  name: text('name').notNull(),
  password: text('password'),
  availability: text('availability'),
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
