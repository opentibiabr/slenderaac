# Getting started with SlenderAAC

This guide takes a first local installation from download to a running website.
Use the commands one at a time; if one fails, resolve its error before continuing.
For an existing installation, go to [Updating](#updating) instead.

[First installation](#first-installation) · [Run and stop](#run-and-stop-the-website) ·
[Common commands](#common-commands) · [Troubleshooting](#troubleshooting)

## Before you start

Install [Git](https://git-scm.com/downloads), a supported
[Node.js LTS release](https://nodejs.org/en/about/previous-releases) with npm, and
[Bun](https://bun.sh/docs/installation). Bun installs the versions recorded in
`bun.lock`; npm runs the project's named commands. Node.js is required even when
you use Bun to launch those commands.

You also need MySQL or MariaDB with the **game server's schema already imported**,
and the `config.lua` used by that server. Follow the
[Canary setup documentation](https://docs.opentibiabr.com/) if the game database
does not exist yet. SlenderAAC adds website tables to that database; it does not
install the game server or import its initial schema.

Open a terminal and check that the tools are available:

```sh
git --version
node --version
bun --version
```

On Windows, use PowerShell. In the commands below, you can replace `npm` with
`npm.cmd`; this avoids the PowerShell script shim. Examples with extra network
options include a separate PowerShell command.

## First installation

### 1. Download and install dependencies

```sh
git clone https://github.com/opentibiabr/slenderaac.git
cd slenderaac
bun install --frozen-lockfile
```

Run all remaining commands from this `slenderaac` folder, where `package.json`
is located. Leave the game server and image packs outside this folder.

### 2. Create and edit the configuration

Copy the example **only if you do not already have `.env`**. It contains your
private configuration; do not replace it during updates or share it in reports.

PowerShell:

```powershell
if (!(Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.dist -Destination .env }
notepad .env
```

Linux/macOS:

```sh
test -f .env || cp .env.dist .env
```

Open `.env` in a text editor. For sibling `canary` and `slenderaac` folders, a
local example is:

```dotenv
SERVER_CONFIG_FILE=../canary/config.lua
PUBLIC_BASE_URL=http://127.0.0.1:5173
SERVER_NAME=Canary
SERVER_ADDRESS=127.0.0.1
SERVER_PORT=7172
```

Adjust these values for your installation and keep the other entries from `.env.dist`:

| Setting                          | What to put there                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `SERVER_CONFIG_FILE`             | The actual `config.lua` loaded by the running game server. Relative paths start at the website folder; use forward slashes on Windows. |
| `PUBLIC_BASE_URL`                | The website address you will open, including its port. This is not the game server port.                                               |
| `SERVER_NAME`                    | Your game world's display name.                                                                                                        |
| `SERVER_ADDRESS` / `SERVER_PORT` | The game server address and game port. These also drive the online/offline check.                                                      |

`SERVER_CONFIG_FILE` supplies the database connection for the website **and its
migration commands**, overriding conflicting connection settings in `DATABASE_URL`.
It does not automatically replace every other `.env` setting. If the website
cannot access that file, leave the path empty and configure `DATABASE_URL` with
the same database used by the game server. See [database configuration](database.md)
for the fallback and validation rules.

Review the other `.env` options before making the site public, particularly
`AUTO_ADMIN_EMAIL`, email settings, public links and payment settings. A newly
registered account matching `AUTO_ADMIN_EMAIL` receives administrator privileges;
choose an address you control. Changing that value does not promote an existing
account. For local browsing without payments, set `ENABLE_STRIPE_CUSTOM=false`
and `ENABLE_STRIPE_CHECKOUT=false`.

Account roles follow the game server: type `5` is Community Manager and type `6`
is God. Both can sign in, but website administration requires God (`6`). Updating
the website does not promote existing accounts; review staff roles in the game
database when upgrading from an older role mapping.

### 3. Prepare the website tables

Back up the game database before applying schema changes. For a game database
that has **never had SlenderAAC installed**, first mark its existing game schema
as the migration starting point:

```sh
npm run migrate:resolve
```

This marks the initial migration as applied; it does not import the game schema.
Skip it if SlenderAAC already manages this database. Do not repeat it on updates.

Then apply the website migrations and generate its database client:

```sh
npm run migrate
npm run generate
```

Each command prints `[database.config]` with the selected database name. Confirm
that it is the game server's database before continuing. A missing table or
divergent migration history needs investigation, not a database reset. See
[database configuration](database.md).

News, events and the other built-in pages are now available in both layouts.
An empty installation has no published news; importing sample content is not
required. See [news and events](news.md) and [support content](support.md) to
manage your own pages after signing in as an administrator.

### 4. Install the images

```sh
npm run install:assets
```

This installs Classic artwork, outfits, items and store images from the
[SlenderAAC asset release](https://github.com/opentibiabr/slenderaac/releases/tag/classic-assets-latest).
It creates an external sibling folder and fills in the four asset paths in `.env`.
Leave empty asset paths alone before the first run; there is no manual download
or Python step for installation. Extracting the image packs can take several
minutes. Wait for the installer to finish.

The layout menu selects a design; it does not download its images. Both layouts
share the outfit, item and store packages. See [asset installation and updates](classic-assets.md)
for custom paths, selected packages and image checks.

### 5. Add the server library, if needed

Spells, creatures, achievements and house definitions need a catalog exported
from your game server. The website can start without it, but those catalogs will
be empty. With sibling checkouts, run:

```sh
npm run import:server-data -- --server-dir ../canary --output ../slender-server-data/library.json
```

Then set this in `.env`:

```dotenv
SERVER_DATA_FILE=../slender-server-data/library.json
```

Adjust both paths to your folders. This reads the current server files; it does
not edit them or switch databases. Repeat the import after changing definitions.
See [the server library guide](server-library.md#import-and-update) for other
datapacks, revision selection and custom definitions. Daily boosted selections
come from the live game database, independently of this catalog export.

## Run and stop the website

For a local website at `http://127.0.0.1:5173`, run:

```sh
npm run dev -- --host 127.0.0.1 --port 5173 --clearScreen false
```

PowerShell:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --clearScreen false
```

Keep this terminal open. Open the **Local** address printed by Vite in your
browser; if the port is occupied, Vite can select another one. The standalone
`--` separates npm's command from the options passed to Vite.

To use port 80, replace `5173` with `80` and set
`PUBLIC_BASE_URL=http://127.0.0.1`. If that port is occupied or permission is
denied, use `5173` for local testing. `--host 127.0.0.1` permits connections from
this PC only. This is the development server; follow the
[deployment guide](deployment.md) for a public service.

Choose **Layout → Classic** or **Layout → Legbone** at the top of the page.
See [layout settings](themes.md) to change the default or lock one layout.

Press **Ctrl+C in the running terminal** to stop. Run the same command to start
again; reinstalling is unnecessary. Restart after changing `.env`, the database
configuration or installed asset paths. A script runner may print a non-zero exit
message after Ctrl+C because the command was interrupted. If the process exits
without your intervention, or errors appeared before you stopped it, capture
those earlier messages using [the diagnostic guide](diagnostics.md).

## Updating

Stop the website and back up its database and configuration first. From the
existing checkout, run:

```sh
git pull --ff-only
bun install --frozen-lockfile
npm run migrate
npm run generate
```

If Git reports conflicting local changes or migrations fail, stop at that step
and inspect the error. Keep your `.env`; compare new options with `.env.dist`
instead of overwriting your configuration. Do not run `migrate:resolve` again.

For an asset update, run `npm run install:assets` before restarting. Package
updates replace managed artwork, so keep custom images separately and follow the
[asset recovery instructions](classic-assets.md#update-and-recovery). Repeat a
server-library import only when its definitions need updating. Finally, start
the website with the same development command above.

## Common commands

All commands run from the application folder. Use `npm.cmd` in PowerShell if needed.

| Task                                         | Command / action                                                  |
| -------------------------------------------- | ----------------------------------------------------------------- |
| Start with Vite's defaults                   | `npm run dev`                                                     |
| Start at a chosen local address              | `npm run dev -- --host 127.0.0.1 --port 5173 --clearScreen false` |
| Stop                                         | Ctrl+C in that terminal                                           |
| Install the locked dependencies              | `bun install --frozen-lockfile`                                   |
| Apply pending website migrations             | `npm run migrate`                                                 |
| Regenerate the database client               | `npm run generate`                                                |
| Install or update all image packs            | `npm run install:assets`                                          |
| Install only outfits, items and store images | `npm run install:assets -- --packs outfits items store`           |
| Show installer options                       | `npm run install:assets -- --help`                                |
| Identify the installed commit                | `git rev-parse --short HEAD`                                      |

## Troubleshooting

| Symptom                                           | First check                                                                                                                                                      |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Missing script`, or no `package.json`            | Open the terminal inside the SlenderAAC folder; update the checkout if the named script is missing.                                                              |
| `npm.ps1` is blocked                              | Use `npm.cmd`; changing PowerShell's execution policy is unnecessary.                                                                                            |
| Classic or account status images are missing      | Install the assets and restart; follow the [image checks](classic-assets.md#images-still-missing).                                                               |
| Legbone background is missing                     | Check `/images/background-artwork.jpg` and the application version; it is bundled with the site, not the external asset packs.                                   |
| Boosted is unavailable or reports `sourceDay="0"` | Confirm the selected database in `[database.config]` and the game server's daily writes; [inspect the source](diagnostics.md#boosted-values-remain-unavailable). |
| Server shows offline                              | Check that the game server is running and `SERVER_ADDRESS` / `SERVER_PORT` are correct. The website can run while the game server is stopped.                    |
| Library pages are empty                           | Import the server catalog and configure `SERVER_DATA_FILE`.                                                                                                      |
| Website remains loading after `VITE ready`        | Open the printed URL, then capture the [startup and request logs](diagnostics.md); the ready line describes the listener, not completed page loading.            |

Include the failing command, commit, runtime versions and relevant log excerpt
when reporting a problem. Do not send passwords, session tokens or your full `.env`.
