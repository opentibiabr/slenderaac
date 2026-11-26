# Use the game server database

SlenderAAC must read and write the same database as the running game server.
Separate databases can both contain valid tables while only one receives daily
boosted selections, character updates and other live data.

## Separate site and migration credentials

In a managed deployment, create a dedicated MySQL account for the site and
another for migrations. Set the site connection in its service environment or
`.env`. For example:

```dotenv
DATABASE_CREDENTIAL_MODE=separate
DATABASE_URL="mysql://site_user:site_password@db.example:3306/game_world"
```

In separate mode, `DATABASE_URL` always selects the website connection,
including development, build, preview and Prisma Client generation.
`SERVER_CONFIG_FILE` does not override it. Set `DATABASE_MIGRATION_URL` only
in the environment of the process running `migrate`, `migrate:resolve` or
`migrate:dev`. Keep it out of the site's environment and shared `.env` files.
For separated deployments, run these package commands as dedicated steps so the
migration secret is available only to the migration step.

Both URLs must specify a username and password, use different MySQL usernames,
and select the same schema name. Different hosts or proxies can legitimately
point to the same server. Verify both connections resolve to the same game
database before migration. A matching schema name alone cannot distinguish
different instances. Percent-encode special characters in the URLs.

Grant the site account only the reads and writes used by its enabled features,
including account and character changes, site and game sessions, and the shop
when enabled. Keep schema changes and grant administration outside the site
account. Give the migration account the schema privileges needed by the SQL in
the upgrade path and access to Prisma's migration history table. A first
installation over Canary runs historical SQL that includes routines and trigger
changes. Validate permissions on a disposable copy before changing a deployed
service. Use `migrate:dev` only in an isolated developer database, where Prisma
also needs a disposable shadow database.

## Legacy configuration

Leaving `DATABASE_CREDENTIAL_MODE` unset or setting it to `legacy` keeps the
shared connection setup.

From the SlenderAAC repository root, set the path to the **actual `config.lua`
loaded by the game server** in `.env`. For sibling checkouts:

```dotenv
SERVER_CONFIG_FILE=../canary/config.lua
```

Relative paths resolve from the website's working directory. An absolute path is
also supported; use forward slashes on Windows. The website process and package
commands need read access to this file. Restart the website after changing it.

When this path is set, its `mysqlHost`, `mysqlPort`, `mysqlUser`, `mysqlPass`,
`mysqlDatabase` and optional `mysqlSock` select the connection. They override
the connection settings in `DATABASE_URL`. Remaining URL options, such as
connection-pool limits and TLS settings, stay website-owned. Credentials are
encoded automatically; do not URL-encode passwords inside `config.lua`.

The reader accepts explicit, unconditional string settings and a numeric port,
as in the standard server configuration. It parses syntax without executing Lua.
Function calls, control flow, indirect/global-table assignments, functions and computed
database settings are unsupported. A missing, unreadable or invalid configured
file stops startup and package commands. It never silently selects `DATABASE_URL`
after such a failure.

If the website cannot read the server configuration, leave `SERVER_CONFIG_FILE`
empty and explicitly configure `DATABASE_URL` with the same database. This is the
only fallback; the application does not search other installations or infer the
database from a catalog export. An available database with seed rows is not
evidence that it is the correct game database.

## Package commands

Keep using the package commands from the repository root:

```sh
npm run migrate
npm run generate
npm run dev -- --host 127.0.0.1 --port 80
```

The same resolver chooses the appropriate credentials for `dev`, `build`,
`preview`, `generate`, `migrate`, `migrate:dev` and `migrate:resolve`.
Bun's corresponding package commands work too. Command arguments and exit
codes are preserved. Migrations run only through an explicit migration command.

Use these package commands instead of invoking `prisma` directly: the Prisma CLI
alone reads `DATABASE_URL` from its schema and bypasses the credential selection.
For initial setup, the selected database must already contain the game server's
schema; follow the [beginner setup sequence](getting-started.md#3-prepare-the-website-tables).

## Check the startup log

```text
[database.config] source=SERVER_CONFIG_FILE database="game-world"
[database.config] DATABASE_URL connection settings differ from config.lua and were ignored. Using SERVER_CONFIG_FILE for the website and database commands.
```

These are illustrative command messages; application logs also include a timestamp
and severity. The warning appears when old connection settings were ignored. It
does not print the URL, username or password. With `SERVER_CONFIG_FILE` configured,
startup also performs one read-only database identity check. Diagnostic mode adds
the database server's hostname and port.

If boosted values remain unavailable, inspect the selected database and the game
server's writes using the [diagnostic guide](diagnostics.md#boosted-values-remain-unavailable).
Selecting the correct database does not create a daily selection or replace the
game server's own update algorithm.
