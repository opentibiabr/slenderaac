# Cip Slender layouts

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

The information strip fills the actual center column. Its width must follow
intrinsic content growth in Quickstart and wide Manual chapters instead of being
capped at the normal 865px column width. Compare the strip, content frame and
right rail together at both desktop widths; checking only the article can miss
a shortened strip above otherwise correct content.

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

### Built-in information pages

`/about/what-is-tibia` uses the compact content frame with its own intrinsic
minimum content width. The route is available on a fresh installation without
database seeding. The default theme renders the built-in introduction; the Cip
theme can load `cip-slender/reference/pages/whatistibia.json` from the external
pack. Missing or invalid documents fall back to the built-in content.

`src/lib/information.ts` registers native destinations. The shared link helper
maps matching official URLs to these routes and preserves query parameters,
anchors and preview flags. Menu groups expand for the active information page.
Additional pages should extend this catalog and reuse the document renderer and
frame rather than add parallel loaders or copy source HTML into the repository.

`/about/screenshots` adds the screenshot gallery. The external document supplies
captions, thumbnails, full images and the card texture. Native Svelte controls
open a dialog, wrap previous/next navigation and support arrow keys and Escape.
`currentscreenshot=<id>` opens a selected image directly, including links from
the right sidebar. Gallery navigation preserves the preview and browser history.

`/about/game-features` reuses the compact document frame, native heading rhythm
and sprite-based bullet list. Captured account-creation buttons become local
navigation actions; they never submit the original site's form. The reusable
action component reads normal/hover sprites from the external document.

`/about/premium-features` uses the shared table frame and shadow surfaces for
the benefit comparison. The external converter turns known helper text into
native tooltips with mouse, focus and Escape support; original handlers are never
executed. The green Premium action navigates to the local shop.

`/about/cipsoft` reuses the contact and compact table variants. Member actions
open local character queries, and institutional links keep their external
destinations. Company text and member lists remain external reference content;
the built-in fallback uses a short introduction without copied company details.

`/guides/quickstart` uses the common document layout and numbered marker sprites.
Its minimum desktop body width follows the native 1020px client illustration.
Account links use local signup, download links use `PUBLIC_DOWNLOAD_URL`, and
guide references retain section queries and fragment anchors.

`/guides/manual` provides the contents and 19 allowlisted `section` destinations
through the same route. Chapters use external `manual-<section>.json` documents.
The updater derives each chapter's minimum body width from its images and list
insets. Native previous/contents/next links and named anchors retain the preview.
Manual styles cover nested lists, image spacing, legacy float breaks and the
shallow table variant without changing the approved news table components.

`/guides/security-hints` reuses the common headings and sprite-based lists.
Inline image alignment retains the source line height instead of accumulating
extra spacing between hints. Security-provider links and account recovery keep
their external destinations until an equivalent local feature is available.

The external document format is version 1: page ID, local headline image with
native dimensions, and a bounded tree of supported text/presentation elements.
The server rejects unknown elements, oversized documents, invalid image URLs and
paths escaping the external pack. The renderer filters attributes again. No
source JavaScript, event handlers or arbitrary styles are executed.

The pack updater accepts repeated `--page ID=HTML` captures. `--pages-only` updates
those pages while retaining the existing news presentation. A full update also
refreshes the information pages already present in the pack. Use captures from a
validated browser if direct public-page requests encounter a challenge.

### Capture and interaction checks

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
