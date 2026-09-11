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
