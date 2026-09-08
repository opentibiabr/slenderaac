# Built-in news and events

Latest News (`/`), News Archive (`/news/archive`) and Event Schedule
(`/news/event-schedule`) are application routes included in every installation.
Both the default `legbone` theme and `cip-slender` expose them in their news menu.
They do not require creating Static Pages, installing a theme pack, enabling a
preview flag or importing sample content.

## Installation and upgrades

Follow the database setup in the [README](../README.md#getting-started). From the
repository root, the normal commands include the news and event schema:

```sh
bun migrate
bun generate
```

The migration adds news types, categories, archive indexes and the event table.
Existing news keep their content and publication state, with type `news` and
category `community`. No public CipSoft content, sample events or administrator
credentials are seeded. An installation without published content shows an empty
news page, empty search results and a working calendar without events.

## Content management

- `/admin/news` manages news, ticker entries and featured articles, including
  categories, publication dates and drafts. Publishing makes them available in
  the public pages; unpublishing removes them from the public queries.
- `/admin/events` manages event dates, descriptions, colors, order and publication.
  Dates include both endpoints. Seasonal entries remain visible without image
  assets through a text symbol and their description.
- The existing administrator authentication applies to both sections. Creating
  or editing content does not require changing a theme or an asset pack.

The home shows the latest ticker entries and news. Archive results link to the
selected article or expand the selected ticker, including older entries.
Archive filters and calendar navigation live in the URL, so reload and browser
history preserve the selected search or month.

## Theme boundary

The routes, server loads, Prisma models and administrative actions are shared.
`src/lib/components/news/TableFrame.svelte` and `TableSurface.svelte` select the
theme's presentation. The default presentation uses the existing application
colors and responsive controls; the Cip presentation delegates to the calibrated
frames without changing their geometry.

The external Cip asset ZIP and optional public-content importer are only needed
for that presentation and visual comparison. See [Cip Slender news layouts](cip-slender.md).
