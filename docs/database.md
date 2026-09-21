# Use the game server database

SlenderAAC must read and write the same database as the running game server.
Separate databases can both contain valid tables while only one receives daily
boosted selections, character updates and other live data.

## Recommended configuration

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

## Website and migrations use the same source

Keep using the package commands from the repository root:

```sh
npm run migrate
npm run generate
npm run dev -- --host 127.0.0.1 --port 80
```

The same resolver prepares `dev`, `build`, `preview`, `generate`, `migrate`,
`migrate:dev` and `migrate:resolve`. Bun's corresponding package commands work
too. Command arguments and exit codes are preserved. The migration commands
only run when explicitly invoked; website startup does not migrate, seed,
copy databases or modify either configuration file.

Use these package commands instead of invoking `prisma` directly: the Prisma CLI
alone reads `DATABASE_URL` from its schema and does not load the game configuration.
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
