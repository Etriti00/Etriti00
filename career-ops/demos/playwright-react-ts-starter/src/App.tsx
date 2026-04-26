import { useReducer } from 'react';

type Todo = { id: string; title: string; done: boolean };
type Action =
  | { type: 'add'; title: string }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string };

function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add':
      return [...state, { id: crypto.randomUUID(), title: action.title, done: false }];
    case 'toggle':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'remove':
      return state.filter((t) => t.id !== action.id);
  }
}

export function App() {
  const [todos, dispatch] = useReducer(reducer, []);

  return (
    <main aria-labelledby="page-title" style={{ maxWidth: 480, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h1 id="page-title">Todos</h1>
      <NewTodoForm onAdd={(title) => dispatch({ type: 'add', title })} />
      <ul aria-label="todo list" style={{ padding: 0, listStyle: 'none' }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 0' }}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => dispatch({ type: 'toggle', id: todo.id })}
              aria-label={`toggle ${todo.title}`}
            />
            <span style={{ flex: 1, textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
            <button
              onClick={() => dispatch({ type: 'remove', id: todo.id })}
              aria-label={`remove ${todo.title}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <p aria-live="polite" data-testid="counter">
        {todos.filter((t) => !t.done).length} open · {todos.filter((t) => t.done).length} done
      </p>
    </main>
  );
}

function NewTodoForm({ onAdd }: { onAdd: (title: string) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const title = String(fd.get('title') || '').trim();
        if (!title) return;
        onAdd(title);
        e.currentTarget.reset();
      }}
      style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
    >
      <input name="title" placeholder="What needs doing?" aria-label="new todo title" style={{ flex: 1 }} />
      <button type="submit">Add</button>
    </form>
  );
}
