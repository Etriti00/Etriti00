# Run apply-helper.mjs on your laptop — exact recipe

The apply-helper has to run on your machine (not the sandbox). Reasons: the browser window has to be visible to **you**, ATS email-verification codes go to **your** inbox, and the Submit button has to be clicked by **your** hand.

Here's the exact 5-minute setup, then a 90-second-per-role apply session.

## One-time setup (5 minutes, run once)

```bash
# 1. Get the snapshot zip out of the sandbox
#    (download career-ops-etrit-snapshot-2026-04-25.zip from the sandbox UI)
unzip career-ops-etrit-snapshot-2026-04-25.zip
cd career-ops

# 2. Install the same deps the sandbox installed
npm install
npx playwright install chromium

# 3. Smoke-test
node apply-helper.mjs 2 --dry-run
```

If `--dry-run` prints the row info + matched PDF + matched cover-letter for Software Mind, you're good.

## Apply session (90 sec per role)

```bash
# Software Mind — apply first (highest fit, no country friction)
node apply-helper.mjs 2

# Wait 5+ min between roles (the helper enforces this)
# Hostaway — second
node apply-helper.mjs 6

# Wait 5+ min
# Grafana Labs — third
node apply-helper.mjs 4
```

For each one:

1. The helper opens a Chromium window with the apply form.
2. Reviews these auto-filled fields: name, email, phone, location, GitHub, file upload of the right PDF, cover-letter textarea.
3. **Open the matching `cover-letters/<slug>-FORM-PACK.md` doc** in another window — paste the per-question short answers from there into any custom-question fields (Greenhouse and Recruitee usually have 3–6 of them).
4. Tick the consent checkbox.
5. **Click Submit yourself** — the helper does NOT click Submit.
6. After Submit, close the browser window. The script exits.
7. Update `data/applications.md` row N status from `Evaluated` → `Applied`.

## Daily ceiling

The helper refuses to run if:

- You've already applied 3+ times today (logged in `data/apply-log.tsv`)
- Your last apply was less than 5 minutes ago
- The row is marked `SKIP`

These are deliberate — ATS systems flag fast-burst applications as bot patterns.

## If something doesn't auto-fill

The autofill is best-effort across Greenhouse / Ashby / Lever / Recruitee / Workable. Selectors miss sometimes. If a field is empty after the page loads:

- Manually paste from the corresponding `cover-letters/<slug>-FORM-PACK.md` "Personal info" table.
- The cover letter and PDF upload are the high-leverage ones to verify; everything else can be retyped in <30 sec.

## Recommended apply sequence today

| Order | Row | Company | Why this order |
|---|---|---|---|
| 1 | #2 | Software Mind | Highest fit (4.6/5), no country friction, fastest-shipping cover letter |
| 2 | #6 | Hostaway | EMEA-remote includes Kosovo, no EOR question, same comp framing |
| 3 | #4 | Grafana Spain | Apply tomorrow, not today — Greenhouse will email-verify and you don't want to fatigue your decision-making in one session |

Saving WunderGraph (#1) and Linear (#5) for next week, *after* you push both demo repos to your GitHub. Both call out OSS samples explicitly; pushing the demos first turns a 4.4 into a 4.6 by closing the only soft gap in those reports.
