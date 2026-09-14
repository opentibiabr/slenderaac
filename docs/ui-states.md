# UI states and data accuracy

These rules apply to Classic and Legbone, including new pages, shared components
and administration screens. A layout changes presentation, never the meaning or
source of the displayed data.

## Show the state the application actually knows

| State                       | Evidence                                            | Expected presentation                                                                                       |
| --------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Loading                     | The request has not completed                       | A loading or unknown state; keep the existing element's space                                               |
| Confirmed zero              | A successful, valid response contains `0`           | Display `0`; do not replace it with an unavailable label                                                    |
| Empty result                | A successful query returns no matching entries      | Explain that nothing matched the current filters                                                            |
| Offline                     | The configured service availability check fails     | Display Offline separately from population or other counters                                                |
| Unavailable or unconfigured | The source, integration or optional asset is absent | Explain what is unavailable; do not invent a count, record or selection                                     |
| Error                       | A request fails or its response is invalid          | Show failure and an appropriate recovery action; never present it as an empty successful result             |
| Stale                       | Previously valid data cannot be refreshed           | Preserve the last value internally, but identify it as stale or unavailable before presenting it as current |
| Permission limited          | The user cannot access the information              | Respect the visibility policy; do not reveal the hidden value or imply it is zero                           |

Use wording that identifies the affected information. A failed image request is
not an empty equipment slot; missing statistics are not zero events; a failed
search is not proof that a character does not exist. A pending payment remains
pending until the authoritative order state changes, even if a refresh times out.

## Server status and player presence

- Population and availability are independent. A reachable server with no players
  is Online with `0` players. An unreachable server is Offline, not an empty world.
- The existing connection probe uses `SERVER_ADDRESS` and `SERVER_PORT`. It proves
  endpoint reachability, not a successful login, healthy gameplay or maintenance mode.
- Database presence rows can survive an unclean shutdown. Character indicators,
  account lists, guild members and guild totals must not claim those players are
  online when the server is unreachable. Unknown availability cannot confirm a
  database row as currently online.
- The shared client status store owns one polling loop for all subscribers. Never
  open a socket or start a polling loop per player, guild row or status icon.
  The last subscriber leaving aborts the request and clears the timer. Server-side
  rendering must not start browser polling or retain request-specific user state.
- The status refresh detects invalid JSON, invalid field types, HTTP failures and
  timeouts. Preserve the last successful result, mark it stale, and recover after
  a valid response. Do not turn a website API failure into a game-server Offline
  result. Failure of the first request leaves the status unknown.
- Character and guild membership data are page-load snapshots. Server availability
  polling does not make each player's presence record a live subscription. Online
  and world tables refresh their data on navigation or reload; keep that distinction
  explicit when changing their refresh behavior.

## Account character status

The account table's Status column reports Daily Reward collection and the
character's hidden setting. Presence is a separate indicator next to the name;
an online/offline dot must never stand in for a reward or visibility status.
Both layouts consume the same authenticated account data.

For Canary, compare `player_storage` key `13412` with the server-save timestamp
in `global_storage` key `14110`. A matching cycle means collected. A successful
claim in `daily_reward_history` during that cycle also means collected: Canary
inserts its `Claimed reward no.` entry immediately, before the player's next save.
Other history entries, such as streak changes, are not evidence of collection.
Do not rely on
the saved `players.isreward` flag or reset rewards using the website's calendar.
An absent/uninitialized cycle or failed query means unknown, not uncollected.
Batch reads for the authenticated account's character IDs; never query per icon.

The hidden icon follows `PlayerSettings.hidden`: the character is omitted from
the public account character list. This does not mean its profile is inaccessible.
Status labels/tooltips must describe that distinction. These values are page-load
snapshots refreshed by navigation/reload, not independently polled per character.
Do not write gameplay reward state from the website.

## Daily selections

- The game server owns the daily creature and boss selection and persists it in
  `boosted_creature` and `boosted_boss` during startup. The website reads those
  tables; it never chooses a replacement or keeps a presentation default.
- The website and game server must use the same database. If their values differ,
  compare the actual connection identity and persisted rows before attributing
  the difference to caching, configuration or a failed game-server write.
- A seed placeholder, zero race ID or empty name is unavailable data. The row's
  `date` is the game server's day-of-month rotation marker. The website must not
  compare it with its own clock because the two processes can use different time
  zones or start at different moments.
- An unavailable selection keeps both portrait frames and labels in place in
  both layouts. Do not remove the whole component or display a sample creature.
- Active browser sessions poll the website endpoint and adopt the new persisted
  selection within one minute without a website restart. A failed refresh preserves
  the last valid value only when it is visibly marked stale.
- The server log reports the first database snapshot and each later change. It
  labels each slot as active or unavailable with the precise reason (`missing`,
  `invalid-name`, `placeholder` or `invalid-race`) and the source day, without
  printing database credentials. Use this line to distinguish unchanged source
  data from a website connected to another database. For timestamps, query timing
  and connection identity, see [server diagnostics](diagnostics.md).
- The client login endpoint uses the same validation. It advertises no boosted
  selection when both rows are absent or placeholders, and never leaks a seed race
  ID as if it were active.

## Shared implementation rules

Keep these decisions in the existing data or component owner. Reuse the same
availability, selection and validation logic across layouts; keep theme styling
scoped. Do not duplicate business logic or replace local data with reference-site
records to make a widget appear populated.

Use `null` or an explicit state when a value is unknown. Apply `?? 0` only when
the source's documented contract defines absence as zero. Do not use truthiness
to distinguish zero from absence, or catch a database error and return `[]`.

Keep loading and failure placeholders inside the established image/frame/control
slot so content does not jump. Provide a readable or accessible status label;
color and an unexplained icon alone do not convey a state. Preserve existing
Portuguese/English translations and layout-specific typography.

Retry only where the operation is safe. Cancel obsolete requests, ignore responses
for a previous item/query, and clean up timers and subscriptions on destruction.
Do not retry a purchase or other mutation merely to refresh the display.

## Review and verification

For each changed data-driven component, check the relevant states above in both
layouts. Include zero, missing data, invalid responses, a failed refresh after
success, recovery, and navigation/unmount when those states are possible.

For player status, test a recorded-online row with a reachable, unreachable and
unknown server. Test multiple indicators together to ensure they share requests.
For empty lists, compare a successful empty response with a failed query rather
than testing only the initial blank screen. Use isolated fixtures for fault
injection; do not stop the real database or submit transactions to exercise errors.

Record the routes, states and checks actually inspected. A component or screenshot
check is not proof that every page, payment or in-game action works. Preserve the
approved shell geometry while making state messages accurate.
