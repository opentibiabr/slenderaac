# Server logs and slow page loads

SlenderAAC writes application logs to the terminal running `npm run dev` or the
deployed Node process. It does not create a log file automatically. Application
startup, price updates and boosted snapshots include the machine's local date,
time with milliseconds, severity and component:

```text
[2026-09-13 21:22:26.417] [info] [dev] HTTP listener ready
[2026-09-13 21:22:27.108] [info] [prices] #1234.1 completed currencies=3 durationMs=42.5
```

These are illustrative lines. Vite and third-party packages retain their own
console formatting. `VITE ready` means its listener is ready; server modules,
database queries and browser modules can still load on the first request. The
terminal remaining at that prompt is normal and is not a progress indicator.

## Capture a diagnostic session

From the repository root, set this in `.env` and restart the website process:

```dotenv
SLENDER_DIAGNOSTICS=true
```

In Windows PowerShell, capture the same development command to a file:

```powershell
cmd /d /c "npm run dev -- --host 127.0.0.1 --port 80 --clearScreen false 2>&1" | Tee-Object -FilePath slender-dev.log
```

Merging the output streams inside `cmd` keeps Windows PowerShell 5.1 from wrapping
ordinary stderr output in a `NativeCommandError` record. Actual application errors
remain in the captured output.

On a POSIX shell:

```sh
npm run dev -- --host 127.0.0.1 --port 80 --clearScreen false 2>&1 | tee slender-dev.log
```

Use the host and port of the affected installation. Open the page, wait for it to
load, then navigate or reload once to compare an initial request with a subsequent
one. In the browser, open **Developer Tools → Network** and **Console**. Note
whether the main document is waiting for a response or whether JavaScript/assets
are still loading after it completes. Record the commit (`git rev-parse --short
HEAD`), runtime versions and command alongside the log. Avoid sharing cookies,
tokens, passwords, full `.env` files or unredacted network exports.

Set `SLENDER_DIAGNOSTICS=false` and restart after the short capture. Diagnostic
logging is opt-in, adds console I/O, and does not install a collector or change
request retries, database timeouts or cache lifetimes.

## Read the stages

| Stage                                    | What the interval includes                                                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http.document`, `http.data`, `http.api` | Vite receiving a dynamic request until the response finishes, including framework/module initialization before the application hook runs; development only |
| `startup`                                | Application server hooks have loaded; includes runtime and process ID                                                                                      |
| `prices`                                 | The existing background international-price update; failure is logged without an unhandled background rejection                                            |
| `sessions.cleanup`                       | Startup and hourly removal of expired sessions; includes the removed count or a sanitized failure code, and a failure leaves the next run scheduled        |
| `database.identity`                      | A read-only query for the actual database name, database-server hostname and port; no user or password                                                     |
| `database.config`                        | The selected configuration source and database name; warns when `config.lua` overrides conflicting URL connection settings                                 |
| `request.locale`, `request.session`      | Language initialization and session lookup when needed                                                                                                     |
| `request.resolve`                        | Framework route loading and response generation; the route template is logged without query strings or concrete account/character identifiers              |
| `layout.*`                               | Shared page data: rankings, pages, account characters, assets, gallery, fansite, poll, server name and presentation                                        |
| `database.boosted`                       | Reading both persisted daily selections                                                                                                                    |

Start and completion lines share the operation's `#` identifier within its stage.
`durationMs` uses a monotonic clock. A started operation without a completion line
was still pending when capture ended, or its process stopped. Nested and parallel
stages overlap; do not add their durations together. HTTP completion includes
response transfer; it does not mean browser rendering has finished.

A long gap before `startup` points to development-server/module initialization.
A long named query or asset step narrows the wait to that dependency. If the
document completes quickly but the page remains loading, inspect the browser's
network requests and console. The appearance of the price-update log alone does
not prove that it caused the wait: the update runs in the background.

Background maintenance must handle rejected work at its launch boundary, log a
sanitized failure, and preserve its next scheduled attempt. It must not leave an
unhandled promise rejection or turn a database error into a successful login or
an empty result. Session reads and account actions retain their normal error and
authorization handling independently of the expired-session cleanup.

Vite's file watcher also runs during initialization. Its default exclusions do
not follow `.gitignore`; a large ignored directory can delay unrelated source
imports while Vite scans and registers its files. The development configuration
excludes these directories at the application root:

- `outfits_anim`, `items` and `static/images/store`: legacy runtime asset packs.
- `build`: generated deployment output.
- `.codex/visual`: local captures and disposable validation artifacts.

Keep these exclusions scoped to their root locations, so source folders such as
`src/routes/items` remain watched. Source edits must still invalidate modules and
update the running development site. Asset serving and database polling do not
depend on this watcher; installed assets are read by their existing handlers.
Use the [asset installer](classic-assets.md) to keep new packs outside the checkout.
Do not disable all watching to work around slow startup. If a long gap remains,
capture Vite's module timings with `--debug transform` and follow its
[performance diagnostics](https://v5.vite.dev/guide/performance).

## Boosted values remain unavailable

`reason=placeholder sourceDay="0"` means the website read an initial database row,
not an active selection. An asset installation cannot turn that row into a daily
creature. The game server owns `boosted_creature` and `boosted_boss`; the website
never draws a replacement itself.

With diagnostics enabled, the browser's `/api/boosted` poll additionally inspects
both tables when either selection is unavailable. You can also open that endpoint
directly. Look for these lines:

- `database.boosted.inspect`: the inspection started, completed, or failed with a
  sanitized error code; its failure does not replace the original API result.
- `boosted.source`: up to five persisted rows per table, with their `date`,
  `boostname`, `raceid`, appearance fields and validation state. `moreRows=true`
  means the sample was truncated. Long text fields are also truncated.

An empty `rows` array means that table had no rows at inspection time. One row
with `date="0"`, `boostname="default"` and `raceid="0"` is the initial seed. Multiple
rows reveal an unexpected source-table state to investigate in the game server;
the website does not choose a replacement row or repair the table automatically.
The sample is a separate read and may overlap a game-server update.

Unchanged source snapshots are logged once; inspection timings continue on each
poll while unavailable, and changed snapshots are printed again. These extra
read-only queries run only with diagnostics enabled and unavailable selections.
No passwords, database connection URLs, account data or session tokens are logged.

First check the `database.config` startup message. Prefer configuring
`SERVER_CONFIG_FILE` so the website and package migration commands use the
running game server's connection settings. A conflicting `DATABASE_URL` is
ignored with a warning; an invalid configured file prevents startup instead of
selecting another database. See [configuration and fallback rules](database.md).
Unavailable snapshots also include a troubleshooting hint without diagnostic
mode, but unchanged snapshots are not printed repeatedly.

Compare the website's `database.identity` log with the running game server's
database configuration. Hostname aliases alone do not establish a mismatch. In
the database used by each process, run these read-only queries:

```sql
SELECT DATABASE() AS database_name, @@hostname AS database_host, @@port AS database_port;
SELECT date, boostname, raceid, looktype FROM boosted_creature;
SELECT date, boostname, raceid, looktype FROM boosted_boss;
```

Compare all rows, including their count, with the game server's selection and
database-write logs. Distinguish an unchanged source, a failed server write, and a
website pointed at another database before changing code or configuration. Once
the shared rows are valid, `/api/boosted` and both layouts should adopt changes
within one minute without a website restart. If the endpoint reports the right
names but images fail, investigate the outfit request and installed assets instead.
See [UI states and data accuracy](ui-states.md#daily-selections) for the contract.
