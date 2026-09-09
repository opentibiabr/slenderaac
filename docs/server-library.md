# Server library

`/library/spells` reads server-owned spell definitions in both themes. The list
supports vocation, group, type and premium filters, sorting, and local detail
links. Detail views retain the list filters when returning. Rune requirements
come from the registered item created by the spell; variable mana is shown as
`var.`. Unknown spell identities return 404.

## Import and update

Install the repository dependencies, then export the server definitions to a file
outside the checkout and outside the public asset directory:

```sh
bun run import:server-data --server-dir /path/to/server --ref main --output /path/to/server-data/library.json
```

Set `SERVER_DATA_FILE` to that output file in the application environment and
restart the application when setting or changing this environment variable.
Subsequent successful imports replace the file atomically; the running
application reloads the changed snapshot on its next request.

`--ref` reads the selected Git revision without switching branches or changing
the server checkout. Omit it to read the current filesystem. The importer reads
`dataPackDirectory` from the local `config.lua`; `--datapack <directory>` overrides
that selection. It combines the shared and selected datapack spell/rune scripts
with the shared vocation definitions. Promotions resolve to their base vocation.
Disabled files, monster script directories and internal command formulas are
excluded from the player catalog.

The importer parses Lua syntax and literal metadata without executing server
scripts or callbacks. Conditional metadata, unresolved expressions, unknown
vocations, duplicate identities and invalid requirements reject the import. An
empty or failed import leaves the previous snapshot unchanged. Custom scripts
with dynamic registrations need an explicit catalog export; they must not be
silently represented by guessed defaults.

For renamed entries or existing links, optionally pass
`--spell-aliases /path/to/spell-aliases.json`. This JSON object maps saved URL
identifiers to a current server spell name or canonical ID. Aliases must resolve
unambiguously to an imported spell and cannot collide with another identity:

```json
{
	"oldhealing": "Healing Touch"
}
```

## Data and presentation

The snapshot uses `schemaVersion: 1`, an import timestamp, an optional source
revision and a `spells` array. Requirements, formula, vocations, premium status,
groups, cooldowns, mana, combat type and rune metadata come from the server.
The application validates and caches this file; it never executes its contents
or exposes it through the public asset endpoint. A missing configuration gives
the library an empty state. An invalid configured file is an error, not an empty
successful import. This workflow does not switch the application database or
modify server files.

The optional external theme pack supplies `headlineSpells` and
`spellIcon-<canonical-id>` assets. Missing artwork leaves the native information
available. Refresh and package those assets with the tools distributed in the
pack. Server catalog exports, credentials, raw source captures and machine-local
paths do not belong in a theme release or the repository.

Classic list panels, detail panels, catalog headings and radio filters share
components. The list uses 21px table rows, while the filter uses native radio
controls with a 19px cadence and container-based reflow. Additional server
vocations or rows naturally change the resulting panel height. Existing native
page panels retain their default variant.
