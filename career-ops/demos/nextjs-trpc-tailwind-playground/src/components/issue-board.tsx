'use client';

import { useState } from 'react';
import { trpc } from './trpc-client';

const STATES = ['open', 'in_progress', 'done'] as const;

export function IssueBoard() {
  const utils = trpc.useUtils();
  const issues = trpc.issues.list.useQuery();

  const create = trpc.issues.create.useMutation({
    onSuccess: () => utils.issues.list.invalidate(),
  });
  const setState = trpc.issues.setState.useMutation({
    onSuccess: () => utils.issues.list.invalidate(),
  });
  const remove = trpc.issues.remove.useMutation({
    onSuccess: () => utils.issues.list.invalidate(),
  });

  const [title, setTitle] = useState('');

  return (
    <section aria-labelledby="board-heading" className="mx-auto max-w-2xl px-4 py-8">
      <h1 id="board-heading" className="mb-6 text-2xl font-semibold tracking-tight">
        Issues
      </h1>

      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = title.trim();
          if (!trimmed) return;
          create.mutate({ title: trimmed });
          setTitle('');
        }}
      >
        <input
          aria-label="new issue title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700"
        />
        <button
          type="submit"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          disabled={create.isPending}
        >
          Add
        </button>
      </form>

      {issues.isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : !issues.data?.length ? (
        <p className="text-sm text-gray-500">No issues yet — add one above.</p>
      ) : (
        <ul aria-label="issues" className="divide-y divide-gray-200">
          {issues.data.map((issue) => (
            <li key={issue.id} className="flex items-center gap-3 py-2">
              <select
                aria-label={`state of ${issue.title}`}
                value={issue.state}
                onChange={(e) =>
                  setState.mutate({
                    id: issue.id,
                    state: e.target.value as (typeof STATES)[number],
                  })
                }
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <span
                className={
                  issue.state === 'done' ? 'flex-1 text-sm text-gray-400 line-through' : 'flex-1 text-sm'
                }
              >
                {issue.title}
              </span>
              <button
                aria-label={`remove ${issue.title}`}
                onClick={() => remove.mutate({ id: issue.id })}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" data-testid="counter" className="mt-6 text-xs text-gray-500">
        {issues.data?.filter((i) => i.state !== 'done').length ?? 0} open ·{' '}
        {issues.data?.filter((i) => i.state === 'done').length ?? 0} done
      </p>
    </section>
  );
}
