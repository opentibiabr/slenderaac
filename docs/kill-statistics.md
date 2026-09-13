# Kill statistics

`/community/kill-statistics` provides a world selector and race totals for the
previous 24 hours and seven days. It uses the configured server name, native
application routes and the same data in Classic and Legbone. The table contains
only races with recorded events during the week. No character names, account
identifiers or private combat records are exposed.

## Installation

Apply the website migrations and regenerate the Prisma client, then install the
bundled integration in the game server:

```sh
bun run migrate
bun run generate
bun run install:server-integration --root <server-directory>
```

The installer requires `config.lua` and the core monster registration library. It
copies `integrations/canary/kill-statistics.lua` to
`data/scripts/slender/kill-statistics.lua`. Start or restart the game server after
installation. The website and game server must use the same database. Review any
locally modified integration before updating it with `--replace`.

The collector is designed for the current Canary monster registration library:
core scripts load before monster definitions, and the shared parser registers the
death event for every monster type. A login event registers the same death event
for each player. Existing creature-specific callbacks remain registered. No
deprecated per-player kill callback or individual monster-file edits are needed.

## Counting and persistence

- A player's death is attributed to the final attacker: a monster race, `players`
  for a player or player-owned summon, or `(elemental forces)` when no attacker is
  available. Staff victims are excluded.
- A non-summoned monster's death counts once when a player or player-owned summon
  is credited. The highest-damage attacker is preferred, with the final attacker
  as fallback. Staff credits and summoned victims are excluded. Party members do
  not multiply the count. Only deaths reported by the server's registered death
  event enter the collector.
- Counters are grouped by process, minute and race. Every 30 seconds the collector
  writes batches of at most 100 rows. Retried writes replace absolute counters;
  they do not increment previously persisted values again. Pending counters remain
  buffered until the complete flush and its heartbeat succeed.
- Current-minute counters remain buffered for subsequent updates. Completed
  minutes are released after a successful flush. The website excludes the current
  partial minute, including future or older-than-week rows. Concurrent page loads
  share one query, cached for up to ten seconds and refreshed at minute boundaries.
- A process retains at most 50,000 pending race/minute entries. Buffer overflow or
  rejected oversized race names mark the history incomplete. Database outages
  preserve buffered counters for retry. An abrupt process termination can lose
  events since the last successful flush; normal shutdown attempts a final flush.
- The collector retains eight days of database rows and removes older data
  hourly. It creates no historical estimates from bestiary totals, player-death
  history or reference-site numbers.

The page distinguishes no collector, a period with no events, incomplete history
and a stale collector. Collection intervals and loss markers determine coverage;
the last update is displayed in UTC. A gap between server runs remains explicit.
This is a statistical view and does not change combat, experience, loot or bans.

## Shared presentation

The world selector reuses `LabeledForm` and the plain `PagePanel`; grouped results
reuse the list panel and table surface. `classic-data-table--grouped` centers
group headings and keeps all header rows on the same background.
`classic-data-table--numeric` right-aligns numeric cells after the label column.
Alternating row colors apply to body rows, including on pages added later.

At a 1919×945 viewport with a 1904px useful body, the world panel is
`x=539, y=262, 833×85`; the selector is `x=685, y=306, 531×19` and Submit is
`x=1221, y=306, 135×25`. The results frame starts at `x=539, y=377`, and its grid
starts at `x=549, y=417` with width 812 and 21px rows. Column allocation and total
height depend on local race names and row count. Small screens scroll the table
inside its own container. The page headline is an optional external asset.

## Validation

```sh
bun test src/lib/kill-statistics.test.ts
lua integrations/canary/tests/kill-statistics.test.lua
```

For the database test, set `SLENDER_TEST_DATABASE=true` in the process environment
against a disposable local database and run:

```sh
bun test src/lib/server/kill-statistics.test.ts
```

The database test creates isolated collector IDs and removes them afterwards.
It checks day/week boundaries, future/current-minute exclusion, independent
collector runs and idempotent updates. The Lua test covers registration,
attribution, summons, staff, privacy, retry, rotation, reload and bounded buffering.
