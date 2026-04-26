import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { issues } from '~/server/db/schema';
import { createTRPCRouter, publicProcedure } from '../trpc';

const stateEnum = z.enum(['open', 'in_progress', 'done']);

export const issuesRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          state: stateEnum.optional(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const where = input?.state ? eq(issues.state, input.state) : undefined;
      return ctx.db
        .select()
        .from(issues)
        .where(where)
        .orderBy(desc(issues.priority), desc(issues.updatedAt))
        .limit(limit);
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        body: z.string().max(5000).optional(),
        priority: z.number().int().min(0).max(5).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(issues).values(input).returning();
      return row;
    }),

  setState: publicProcedure
    .input(z.object({ id: z.number().int().positive(), state: stateEnum }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(issues)
        .set({ state: input.state, updatedAt: new Date() })
        .where(eq(issues.id, input.id))
        .returning();
      return row;
    }),

  remove: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(issues).where(eq(issues.id, input.id));
      return { ok: true } as const;
    }),
});
