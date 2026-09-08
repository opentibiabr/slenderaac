# Cip Slender news layouts

These are [built-in SlenderAAC pages](news.md), available in the default theme
without an external pack. The pack supplies Cip presentation assets and optional
comparison content; it does not install routes or database features.

The theme renders Latest News (`/`), News Archive (`/news/archive`) and Event
Schedule (`/news/event-schedule`) through the same shell and content-frame family.
`layout.ts` chooses the news, compact and wider compact variants. `TableFrame`
owns caption rails and corners; `TableSurface` owns the table shadows. New pages
with the same structure should reuse these components before adding page CSS.
The shared wrappers in `src/lib/components/news/` select the default or Cip
presentation while keeping the same route data and controls.

## Local setup

Apply the repository migrations and generate the Prisma client through the usual
application setup. The news migration adds types, categories and optional imported
presentation to `News`, and introduces `ScheduleEvent` with inclusive UTC dates.
Existing news default to type `news` and category `community`.

Extract the separately distributed theme ZIP outside the checkout. Set
`THEME_ASSETS_ROOT` in the server environment to the directory containing
`cip-slender/manifest.json`, then start the normal dev server. Verify an actual
asset such as `/theme-assets/cip-slender/content/cip-border-1.gif`; the manifest
itself is intentionally not a public endpoint.

Normal routes read published content from the database. `/admin/news` edits news,
ticker and featured articles, categories, dates and publication status.
`/admin/events` edits event ranges, descriptions, colors, seasonal display, order
and publication. Both use the existing administrator authentication hook.

The external ZIP includes `tools/update-cip-assets.py`, a PowerShell wrapper,
`export-cip-source.js`, `import-cip-content.mjs` and their README. Assets, captured
public content and source maps stay in that pack. The updater prepares a ZIP,
SHA-256 checksum and change report. The optional importer uses stable IDs and the
application's existing Prisma client against a local test database. Follow the
pack README for the single-command refresh/import workflow and its prerequisites.

## Presentation and navigation

Imported articles use a validated presentation tree rendered through shared
Svelte components. Only the supported tags and presentation attributes survive;
source scripts, handlers and arbitrary inline CSS are not executed. Title/date
edits preserve the presentation and same-day ordering. Editing the body replaces
the imported presentation with the normal Markdoc renderer.

The pack's presentation data supplies current promo assets/text, menu destinations,
sidebar links, footer and calendar colors. Routes with local equivalents remain
local; public modules without an equivalent keep their official destination.
Internal preview links preserve `themePreview` and the active comparison flags.

The development-only `cipReference=1` flag explicitly loads external Home/Archive
fixtures; `cipDemo=1` loads the captured calendar month. Without those flags, both
pages exercise the database. Calendar dates use UTC; its timestamp uses Berlin
time with the correct daylight-saving abbreviation. Archive defaults cover the
last 30 days, normalize invalid day/month combinations and swap inverted ranges.

## Visual verification

Capture both sites freshly in the same viewport before changing shared geometry.
Keep full captures, same-origin crops, amplified differences and DOM measurements.
Some browser screenshot exports are resampled; record their actual pixel sizes
and use DOM/Range coordinates to distinguish export differences from layout drift.
Compare background-only areas first and keep a matching background fixed.

Review all three news layouts after a shared change. Check desktop widths and the
mobile menu, article images and horizontally scrollable tables. Treat live
counters, rotating promotions, fansite logos and timestamps separately from their
frame geometry. Use `cipGrid=1` to show the non-interactive alignment grid.

Exercise archive filters, draft visibility, old article/ticker links, ticker
expansion, browser back/forward, calendar month/year boundaries and admin edits.
Builds are separate from this visual and runtime review.
