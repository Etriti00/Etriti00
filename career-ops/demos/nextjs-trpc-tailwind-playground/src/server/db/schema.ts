import { pgTable, serial, text, timestamp, integer, index } from 'drizzle-orm/pg-core';

export const issues = pgTable(
  'issues',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body'),
    state: text('state', { enum: ['open', 'in_progress', 'done'] }).notNull().default('open'),
    priority: integer('priority').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    stateIdx: index('issues_state_idx').on(t.state),
    priorityIdx: index('issues_priority_idx').on(t.priority),
  })
);

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
