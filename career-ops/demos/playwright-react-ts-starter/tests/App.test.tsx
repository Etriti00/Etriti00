import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../src/App';

// userEvent is dynamically imported inside each test to avoid coupling the
// top-level import to a specific path before `npm install` runs.

describe('App (unit)', () => {
  it('renders heading and an empty counter', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /todos/i })).toBeInTheDocument();
    expect(screen.getByTestId('counter')).toHaveTextContent('0 open');
  });

  it('adds a todo on submit', async () => {
    const u = (await import('@testing-library/user-event')).default.setup();
    render(<App />);
    await u.type(screen.getByLabelText(/new todo title/i), 'write tests');
    await u.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText('write tests')).toBeInTheDocument();
    expect(screen.getByTestId('counter')).toHaveTextContent('1 open');
  });

  it('toggles done state', async () => {
    const u = (await import('@testing-library/user-event')).default.setup();
    render(<App />);
    await u.type(screen.getByLabelText(/new todo title/i), 'ship it');
    await u.click(screen.getByRole('button', { name: /add/i }));
    await u.click(screen.getByLabelText(/toggle ship it/i));
    expect(screen.getByTestId('counter')).toHaveTextContent('0 open');
    expect(screen.getByTestId('counter')).toHaveTextContent('1 done');
  });
});
