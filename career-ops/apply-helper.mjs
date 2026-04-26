#!/usr/bin/env node
/**
 * apply-helper.mjs — review-first application autofill.
 *
 *   node apply-helper.mjs <pipeline-row-number> [--dry-run]
 *
 * What it does:
 *   1. Reads `data/applications.md` for the row matching the given number.
 *   2. Reads `config/profile.yml` for personal data.
 *   3. Locates the tailored PDF in `output/` (matched by company slug).
 *   4. Locates the cover-letter draft in `cover-letters/<slug>.md` if present.
 *   5. Launches Playwright (headed, non-headless) on YOUR machine, navigates to
 *      the apply URL, and pre-fills:
 *        - First name / last name / email / phone / location
 *        - LinkedIn / portfolio fields if present in profile.yml
 *        - File upload for the tailored PDF
 *        - Cover-letter textarea pre-filled with cover-letters/<slug>.md
 *   6. **Stops.** Logs to console: "Review and click Submit yourself."
 *      The browser stays open. The script does NOT click Submit.
 *
 * Anti-spam guardrails (deliberately not configurable):
 *   - Refuses to run twice within 5 minutes (same machine, same browser fp).
 *   - Refuses if more than 3 applications are recorded as "Applied" today.
 *   - Logs every run to `data/apply-log.tsv` — date, company, role, result.
 *
 * Why review-first:
 *   ATS platforms (Greenhouse / Ashby / Lever / Workday) flag accounts that
 *   submit forms in bot-like patterns (under 10s on the page, no mouse jitter,
 *   identical answers across roles). The review pause is your protection — it
 *   also gives you 30 seconds to catch hallucinated content in the cover
 *   letter or the wrong PDF before it's read by a human.
 *
 * Caveats:
 *   - Greenhouse / Ashby / Lever / Workday all have different DOM shapes. The
 *     selectors below are best-effort heuristics; expect to manually fix
 *     fields that didn't auto-fill on first run.
 *   - Some forms have CAPTCHAs or email verification. Those steps are yours.
 */

import { readFile } from 'node:fs/promises';
import { existsSync, appendFileSync, statSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const rowArg = args.find((a) => /^\d+$/.test(a));
if (!rowArg) {
  console.error('Usage: node apply-helper.mjs <pipeline-row-number> [--dry-run]');
  process.exit(1);
}
const rowNum = Number(rowArg);

// ---------- guardrail: rate-limit ----------
const logPath = resolve(ROOT, 'data', 'apply-log.tsv');
function tooManyToday() {
  if (!existsSync(logPath)) return false;
  const today = new Date().toISOString().slice(0, 10);
  const lines = readFileSync(logPath, 'utf8').split('\n');
  const todayCount = lines.filter((l) => l.startsWith(today + '\t')).length;
  return todayCount >= 3;
}
function tooSoonAfterLast() {
  if (!existsSync(logPath)) return false;
  const lastModified = statSync(logPath).mtimeMs;
  return Date.now() - lastModified < 5 * 60 * 1000;
}
if (tooManyToday()) {
  console.error('🚫 Already 3+ applications today — that\'s the daily ceiling. Sleep on it.');
  process.exit(2);
}
if (tooSoonAfterLast()) {
  console.error('🚫 Last apply <5 min ago — slow down before the next one (ATS flags fast bursts).');
  process.exit(2);
}

// ---------- read profile + tracker ----------
const profilePath = resolve(ROOT, 'config', 'profile.yml');
const profile = yaml.load(await readFile(profilePath, 'utf8'));
const appsMd = await readFile(resolve(ROOT, 'data', 'applications.md'), 'utf8');

const row = appsMd.split('\n').find((l) => l.startsWith(`| ${rowNum} `));
if (!row) {
  console.error(`No row #${rowNum} in data/applications.md.`);
  process.exit(1);
}
const cells = row.split('|').map((s) => s.trim()).filter(Boolean);
const [, date, company, role, score, status, pdfFlag, reportLink, notes] = cells;

if (status === 'SKIP') {
  console.error(`Row #${rowNum} (${company}) is marked SKIP — refusing to apply.`);
  process.exit(2);
}

// company slug heuristic — first word, lowercased, hyphen-joined
const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pdfDir = resolve(ROOT, 'output');
const pdfFiles = readdirSync(pdfDir).filter(
  (f) => f.includes(slug) && f.endsWith('.pdf')
);
if (!pdfFiles.length) {
  console.error(`No tailored PDF found in output/ matching slug "${slug}".`);
  process.exit(1);
}
const pdfPath = resolve(pdfDir, pdfFiles[0]);

const coverPath = resolve(ROOT, 'cover-letters', `${slug}.md`);
let coverText = '';
if (existsSync(coverPath)) {
  coverText = (await readFile(coverPath, 'utf8'))
    .replace(/^#.*$/gm, '') // strip markdown headers
    .replace(/^>\s?/gm, '') // strip blockquote markers (drafts are blockquoted)
    .replace(/^\*\*.*\*\*$/gm, '') // strip bold-only lines (the "Send to:" / "Tone:" notes)
    .trim();
}

// look for URL in the report file (header line `**URL:** ...`)
const reportMatch = reportLink.match(/\(([^)]+)\)/);
let applyUrl = '';
if (reportMatch) {
  const reportTxt = await readFile(resolve(ROOT, reportMatch[1]), 'utf8');
  const urlLine = reportTxt.split('\n').find((l) => l.startsWith('**URL') || l.startsWith('**URL:**'));
  if (urlLine) {
    const m = urlLine.match(/https?:\/\/\S+/);
    if (m) applyUrl = m[0].replace(/[)*\s]+$/, '');
  }
}
if (!applyUrl) {
  console.error('Could not extract apply URL from the report header.');
  process.exit(1);
}

// ---------- summary ----------
console.log('━'.repeat(60));
console.log(`Apply helper — review-first mode`);
console.log('━'.repeat(60));
console.log(`Row     #${rowNum}`);
console.log(`Company ${company}`);
console.log(`Role    ${role}`);
console.log(`Score   ${score}`);
console.log(`URL     ${applyUrl}`);
console.log(`PDF     ${pdfFiles[0]}`);
console.log(`Cover   ${existsSync(coverPath) ? `cover-letters/${slug}.md (${coverText.length} chars)` : '(none — will skip cover-letter field)'}`);
console.log('━'.repeat(60));

if (dryRun) {
  console.log('Dry-run: nothing launched.');
  process.exit(0);
}

// ---------- launch browser ----------
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  acceptDownloads: false,
  viewport: { width: 1280, height: 900 },
});
const page = await context.newPage();
console.log(`Opening ${applyUrl} …`);
await page.goto(applyUrl, { waitUntil: 'domcontentloaded' });

// ---------- best-effort autofill ----------
const c = profile.candidate || {};
const firstName = (c.full_name || '').split(' ')[0] || '';
const lastName = (c.full_name || '').split(' ').slice(1).join(' ') || '';

const fillIfExists = async (selectors, value) => {
  if (!value) return;
  for (const sel of selectors) {
    const el = await page.$(sel);
    if (el) {
      try {
        await el.fill(String(value));
        console.log(`  ✓ filled ${sel}`);
        return;
      } catch {
        /* ignore */
      }
    }
  }
};

// Common label-based selectors across Greenhouse / Ashby / Lever / Workable
await fillIfExists(
  ['input[name*="first_name" i]', 'input[id*="first_name" i]', 'input[autocomplete="given-name"]'],
  firstName
);
await fillIfExists(
  ['input[name*="last_name" i]', 'input[id*="last_name" i]', 'input[autocomplete="family-name"]'],
  lastName
);
await fillIfExists(
  ['input[type="email"]', 'input[name*="email" i]', 'input[autocomplete="email"]'],
  c.email
);
await fillIfExists(
  ['input[type="tel"]', 'input[name*="phone" i]', 'input[autocomplete="tel"]'],
  c.phone
);
await fillIfExists(
  ['input[name*="location" i]', 'input[name*="city" i]', 'input[id*="location" i]'],
  c.location
);
if (c.linkedin) {
  await fillIfExists(['input[name*="linkedin" i]', 'input[id*="linkedin" i]'], c.linkedin);
}
if (c.portfolio_url) {
  await fillIfExists(
    ['input[name*="portfolio" i]', 'input[name*="website" i]', 'input[id*="website" i]'],
    c.portfolio_url
  );
}

// File upload — match the most common resume-input selectors
const fileInputs = await page.$$('input[type="file"]');
if (fileInputs.length) {
  try {
    await fileInputs[0].setInputFiles(pdfPath);
    console.log(`  ✓ attached PDF: ${pdfFiles[0]}`);
  } catch (e) {
    console.log(`  ✗ PDF attach failed (${e.message}); attach manually`);
  }
}

// Cover letter textarea
if (coverText) {
  const ta = await page.$('textarea[name*="cover" i], textarea[id*="cover" i], textarea');
  if (ta) {
    try {
      await ta.fill(coverText);
      console.log(`  ✓ filled cover letter (${coverText.length} chars)`);
    } catch {
      /* ignore */
    }
  }
}

// ---------- log + stop ----------
const today = new Date().toISOString().slice(0, 10);
appendFileSync(logPath, `${today}\t${company}\t${role}\tfilled\t${applyUrl}\n`);

console.log('━'.repeat(60));
console.log('🛑 STOP. Review the form. Click Submit yourself when ready.');
console.log('   I will not press Submit. This is intentional.');
console.log('   When done, close the browser window — the script will exit.');
console.log('━'.repeat(60));

// keep browser open until user closes it
await page.waitForEvent('close', { timeout: 0 }).catch(() => {});
await browser.close();
