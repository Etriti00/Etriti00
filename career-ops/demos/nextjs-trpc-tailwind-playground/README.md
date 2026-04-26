# nextjs-trpc-tailwind-playground

[![ci](https://github.com/Etriti00/nextjs-trpc-tailwind-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/Etriti00/nextjs-trpc-tailwind-playground/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A small full-stack TypeScript playground: **Next.js 14 (App Router) + tRPC v11 + Tailwind + Drizzle/Postgres**, with Playwright + GitHub Actions CI.

## Why

The smallest realistic artifact that demonstrates the full TypeScript-end-to-end loop:

- **Browser → tRPC → Drizzle → Postgres**, with end-to-end inferred types (no codegen).
- **Server-side validation via Zod** at the API boundary (one schema, FE + BE parsers).
- **Optimistic invalidation** through `@tanstack/react-query` + `trpc.useUtils`.
- **Playwright E2E** running against a Postgres service container in CI.

Built specifically as an interview portfolio piece for senior full-stack TypeScript roles where tRPC, Postgres, and lean-team ownership are the bar.

## What's in the box

```
src/
├── app/                     Next.js App Router
│   ├── layout.tsx           tRPC + Tailwind providers
│   ├── page.tsx             root → renders <IssueBoard />
│   └── api/trpc/[trpc]/     tRPC fetch-adapter handler
├── components/
│   ├── trpc-provider.tsx    React Query + tRPC client provider
│   ├── trpc-client.ts       typed tRPC react hook root
│   └── issue-board.tsx      the actual UI
└── server/
    ├── api/
    │   ├── root.ts          merged appRouter
    │   ├── trpc.ts          tRPC instance + context
    │   └── routers/issues.ts CRUD over the issues table
    └── db/
        ├── index.ts         drizzle client (connection-pooled)
        └── schema.ts        single `issues` table + indexes
```

## Local

```bash
npm install
cp .env.example .env.local      # adjust DATABASE_URL if needed
npm run db:push                 # push the schema to Postgres
npm run dev                     # http://localhost:3000

npm run e2e                     # Playwright E2E
npm run typecheck               # tsc --noEmit
```

Postgres needed locally — easiest path is `docker run --rm -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=playground postgres:16`.

## Patterns this demonstrates (ATS-keywords friendly)

TypeScript end-to-end · React 18 (Server Components + Client Components split) · tRPC v11 · Drizzle ORM · PostgreSQL · Zod · Tailwind CSS · Playwright · GitHub Actions matrix · service containers · optimistic UI · query invalidation · accessible-by-default UI (aria-labels, aria-live, keyboard flow) · async-first remote contributor workflow.

## License

MIT — adapt freely.
