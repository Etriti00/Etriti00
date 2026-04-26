import { createTRPCRouter } from './trpc';
import { issuesRouter } from './routers/issues';

export const appRouter = createTRPCRouter({
  issues: issuesRouter,
});

export type AppRouter = typeof appRouter;
