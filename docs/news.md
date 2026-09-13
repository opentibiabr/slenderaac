# Built-in news and events

Latest News (`/`), News Archive (`/news/archive`) and Event Schedule
(`/news/event-schedule`) are application routes included in every installation.
Both the default `legbone` theme and `classic` expose them in their news menu.
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
category `community`. No public Server content, sample events or administrator
credentials are seeded. An installation without published content shows an empty
news page, empty search results and a working calendar without events.

## Content management

- `/admin/news` manages news, ticker entries and featured articles, including
  categories, publication dates and drafts. Publishing makes them available in
  the public pages; unpublishing removes them from the public queries.
- `/admin/events` manages event dates, descriptions, colors, order and publication.
  Dates include both endpoints. Seasonal entries remain visible without image
  assets through a text symbol and their description.
- `/admin/world-quests` manages local event and task definitions, publication,
  display order and recorded results. See [World quests](#world-quests).
- The existing administrator authentication applies to both sections. Creating
  or editing content does not require changing a theme or an asset pack.

The home shows the latest ticker entries and news. Archive results link to the
selected article or expand the selected ticker, including older entries.
Archive filters and calendar navigation live in the URL, so reload and browser
history preserve the selected search or month.

## World quests

`/library/world-quests` is included in both themes. Administrators create a quest
with a stable URL identifier, name, description and kind. Scheduled world events
reuse calendar occurrences; world tasks have no required schedule. Upcoming,
running and past or unscheduled events remain discoverable from the list.
The public detail URL uses `?worldquest=<identifier>`.

Choose the quest in the calendar form to link an occurrence. Blank title and
description fields inherit the quest text, so editing the definition updates all
linked occurrences without copying it. Explicit calendar text overrides remain
available. Dates include both endpoints in UTC. Publishing a calendar occurrence
does not expose an unpublished parent quest.

Record success or failure explicitly in the quest editor. Event results require
an occurrence belonging to that quest and a historical UTC timestamp within its
dates. Each occurrence accepts one result; task results are independent. Results
have their own publication flag. A draft quest, occurrence or result is omitted
from public history and counts. Elapsed dates never imply failure.

History counts recorded results for the configured local world and displays
50 entries per page. It does not infer a ranking across unrelated worlds. Saved
unique display-name links remain supported; stable identifiers take priority.

Remove a linked result before deleting its calendar occurrence, moving it to
another quest or changing its dates to exclude the recorded timestamp. Deleting
a quest removes its own occurrences and results together. Changes to the quest
kind require removing existing dates and results first. Administrator permissions
and confirmation dialogs apply to these operations.

The normal migration and client-generation commands above install the quest
tables and optional calendar relation. Existing independent calendar events keep
their content and behavior. No quests, results or administrator accounts are
seeded; an empty installation shows working empty states. Server-library imports
do not turn individual character quests into cooperative world events or invent
future event dates.

## Theme boundary

The routes, server loads, Prisma models and administrative actions are shared.
`src/lib/components/news/TableFrame.svelte` and `TableSurface.svelte` select the
theme's presentation. The default presentation uses the existing application
colors and responsive controls; the Classic presentation delegates to the calibrated
frames without changing their geometry.

The external Classic asset ZIP and optional public-content importer are only needed
for that presentation and visual comparison. See [Classic news layouts](classic.md).
