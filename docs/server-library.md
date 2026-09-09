# Server library

`/library/spells` reads server-owned spell definitions in both themes. The list
supports vocation, group, type and premium filters, sorting, and local detail
links. Detail views retain the list filters when returning. Rune requirements
come from the registered item created by the spell; variable mana is shown as
`var.`. Unknown spell identities return 404.

`/library/creatures` lists the server's Bestiary definitions. Its local detail
pages show maximum health, elemental strengths and weaknesses, summon/convince
requirements, locations, base experience and configured loot. Previous, next
and back links retain theme preview. `/library/boostable-bosses` lists registered
Archfoe boss types with a boss race ID. Boss portraits are informational. Both
pages read the daily boosted selection from the application database.

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

Creature definitions come from the shared and selected datapack `monster`
directories; loot item names come from `data/items/items.xml`. An unnamed item
keeps its configured numeric identity, displayed as `item #123`, rather than
receiving a guessed name. Elemental resistance limits come from local
`minElementalResistance` and `maxElementalResistance`, defaulting to -200 and 200.
The registration rule preserves complete immunity to all seven player elements.
Experience values are base values before player stages and other game bonuses.

The importer parses Lua syntax and literal metadata without executing server
scripts or callbacks. Conditional metadata, unresolved expressions, unknown
vocations, duplicate identities and invalid requirements reject the import. An
empty or failed import leaves the previous snapshot unchanged. Custom scripts
with dynamic registrations need an explicit catalog export; they must not be
silently represented by guessed defaults.

Creature identities use the registered type name, preserving variants even when
their displayed game names or Bestiary/boss race IDs overlap. Shared race IDs do
not merge statistics. A boosted selection must match a name and race ID, or a
unique race ID; ambiguous selections do not get a guessed link or portrait.
The boss list describes registered Archfoe types, not a reconstructed runtime
lottery: shared IDs and runtime registration order can affect that lottery.
Runtime-generated variants and callbacks require an explicit server export.

For renamed entries or existing links, optionally pass
`--spell-aliases /path/to/spell-aliases.json`. This JSON object maps saved URL
identifiers to a current server spell name or canonical ID. Aliases must resolve
unambiguously to an imported spell and cannot collide with another identity:

```json
{
	"oldhealing": "Healing Touch"
}
```

`--creature-aliases /path/to/creature-aliases.json` accepts the same mapping for
registered creature names or canonical IDs. Each import validates spells and
creatures before replacing the snapshot; a missing or malformed creature catalog
cannot erase the existing spell catalog, and vice versa.

## Data and presentation

The snapshot uses `schemaVersion: 1`, an import timestamp, an optional source
revision, a `spells` array and a `creatures` array. Older spell-only snapshots
continue to serve spells and show an empty creature library until refreshed.
Requirements, formula, vocations, premium status,
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

Creature artwork uses `creatureIcon-<canonical-id>`; catalog navigation uses
`catalogPrevious`, `catalogNext` and `catalogBack`. The external artwork helper
can reuse a portrait for variants with an identical complete native outfit.
Unmatched artwork remains optional; missing images never hide an entry or its
detail link. The pack's captured page content does not define the creature or
boss catalogs.

The pack's optional `render-server-art.py` helper fills missing portraits from
the running local app after `OUTFIT_ASSETS_ROOT` is configured. It uses native
outfit colors, addons and mount animation; creatures with item appearances use
numbered GIFs from a matching local item pack. It requires Pillow and accepts
`--server-data`, `--renderer-url` and `--item-assets-root`. The renderer origin
must be local. The helper validates every animation before activating the
manifest and keeps only the resulting 64px images and hashes in the theme pack.

Repeat the helper after changing server appearances to refresh generated
portraits, then package the result with `--package-only`. Existing mapped art is
preserved unless `--all` is supplied. The normal reference updater preserves
generated portraits. Missing or invalid native sprites abort the refresh without
changing the active manifest. See the helper README shipped in the external ZIP
for installation and refresh commands.

Classic list panels, detail panels, catalog headings and radio filters share
components. The list uses 21px table rows, while the filter uses native radio
controls with a 19px cadence and container-based reflow. Additional server
vocations or rows naturally change the resulting panel height. Existing native
page panels retain their default variant.
