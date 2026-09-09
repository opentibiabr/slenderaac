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

`/library/achievements` groups the server's public achievements by grade and
sorts them by name. Grade point ranges and the secret total come from the server
catalog. Secret identities and descriptions are excluded from page responses.
Section links work with keyboard navigation and saved fragments; the section
menu stays visible when scrolling, and each caption links back to the page top.
Older unavailable-menu links automatically upgrade to this local page.

Character profiles read achievement points and unlocks from native `kv_store`
values. Points are not recalculated from catalog entries. A missing points key
uses the game's zero default; malformed numeric storage is shown as unavailable.
Only selected, still-earned achievements appear in public profile data. Unselected
secret achievements remain private.

Account owners manage the selection from **Achievements** beside a character.
The editor accepts up to five distinct earned achievements and can clear the
display. Ownership and deletion status are checked again when saving. Choices
are stored in `slender_achievement_showcase`, created by the normal application
migrations; saving never changes native points or unlock records. A missing
catalog disables editing until the server-library snapshot is available.

`/worlds` lists the configured game world and opens its local details with
`?world=<name>`. It uses the application's database for online players and the
native `server_config.players_record` value. The detail page includes status,
available world settings, sortable players, letter anchors and character search.
Unknown world selections return 404. The application currently has one database
and one configured world; it does not aggregate unrelated servers.
Vocations sort by their displayed names, with higher-level players first inside
each group. Sorting toggles the direction across column changes; older combined
`order=name_desc` links remain valid. Other player-list routes keep their
existing sorting defaults.

## Import and update

`/houses` searches the active map's houses by town, occupancy and house type,
with name, size, rent, public bid and auction-end sorting. Details and Back links
retain the filters and selected layout. Current ownership and public auction
values come from the application database. Modern auction columns take precedence
when obsolete compatibility columns also exist. Private maximum bids are never
queried or included in page responses.

House map IDs, client artwork IDs, guildhall classification, entrance coordinates
and bed capacity come from the selected map's definitions. Existing database rows
absent from that map are excluded without deleting or changing them. Bed capacity
is distinct from the number of beds currently installed. Optional operator-supplied
150x150 illustrations use the external asset key `house-<clientId>`.

This page provides search and inspection. Web bidding, transfers and move-out
actions still require a game-server integration and are not implemented here.
The current game server owns these actions in memory; writing auction columns
from the website would race its save cycle. The page directs players to the
client's house controls while that integration remains pending.

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

The importer reads `mapName` from the same local configuration and loads
`<datapack>/world/<mapName>-house.xml` from the selected revision. Override that
relative file with `--house-file <relative-house-file>`. Missing selected files,
empty definitions, duplicate map IDs and invalid coordinates reject the import.
Servers without imported house definitions expose an empty house catalog.

The same import projects `serverName`, `location`, `worldType` and `maxPlayers`
from local `config.lua` into an optional `world` object. These settings remain
local even when `--ref` selects another revision of the game definitions. Only
unconditional literal values are accepted, and no other configuration fields or
credentials enter the export. `SERVER_NAME` takes precedence over the imported
name for website and client-login identity; `PVP_TYPE` overrides the public
world's imported PvP label. Keep these environment values aligned with the game
configuration and repeat the import after changing server settings.

Creature definitions come from the shared and selected datapack `monster`
directories; loot item names come from `data/items/items.xml`. An unnamed item
keeps its configured numeric identity, displayed as `item #123`, rather than
receiving a guessed name. Elemental resistance limits come from local
`minElementalResistance` and `maxElementalResistance`, defaulting to -200 and 200.
The registration rule preserves complete immunity to all seven player elements.
Experience values are base values before player stages and other game bonuses.

Achievement definitions come from `data/scripts/lib/register_achievements.lua`.
The importer verifies its literal table and registration loop, including the
standard missing-field guards and registration defaults. Conditional registration,
runtime mutations, indirect calls and unresolved metadata require an explicit
export. Helper function declarations after registration are not executed.

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
registered creature names or canonical IDs. Each import validates spells,
creatures and achievements before replacing the snapshot. A missing or malformed
section cannot erase any previously installed section.

For display names inherited in achievement descriptions, optionally pass
`--display-text /path/to/display-text.json`. The JSON object maps whole words or
phrases, case-insensitively, to display text or identity placeholders:

```json
{
	"Old Realm": "{{serverName}}",
	"Old Realm citizens": "{{serverName}} players"
}
```

Replacements run once, longest match first, only on descriptions. Native IDs,
achievement names, grades, points and secret flags stay intact. The app resolves
`{{serverName}}` from its configured identity at display time. Keep this map
outside the checkout and pass it on every refresh that needs those substitutions.

## Data and presentation

The snapshot uses `schemaVersion: 1`, an import timestamp, an optional source
revision, an optional `world` object, and `spells`, `creatures` and `achievements`
arrays. Older snapshots
continue to serve their existing sections and show an empty state for a missing
section until refreshed.
Requirements, formula, vocations, premium status,
groups, cooldowns, mana, combat type and rune metadata come from the server.
The application validates and caches this file; it never executes its contents
or exposes it through the public asset endpoint. A missing configuration gives
the library an empty state. An invalid configured file is an error, not an empty
successful import. This workflow does not switch the application database or
modify server files.

Worlds without imported metadata still use the configured name and PvP mode.
Missing location and player-limit values are left unspecified. A zero player
limit means unlimited; missing or malformed historical records are shown as
unrecorded. No creation date, record timestamp, third-party protection status or
world-quest result is inferred. Online lists and counters share the same public
player filter, excluding deleted characters and staff. Connection status probes
only `SERVER_ADDRESS`/`SERVER_PORT` and finishes within 1.5 seconds; database
failures remain errors rather than appearing as an empty server.

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

World selection and character search share `LabeledForm`; unstriped properties
use the plain `CatalogDetails` variant. `PagePanel` has plain and flush variants
for these compact details and player tables, with a 15px gap between panels.
Online lists share `AlphabetNavigation`, sorting URLs and the configured preview.
The `headlineWorlds` asset is optional. Older menu packs that label `/online` as
Worlds are upgraded to `/worlds`, while direct online-player links keep working.

Optional `worldLocation-<region>` and `worldPvp-<mode>` assets retain their native
48x48px slots; region names use lowercase words separated by hyphens. The
10x10px `sortAscending`/`sortDescending` assets indicate the next sort direction.
The plain panel sets a shared rail-color variable on `TableFrame`, so component
stylesheet loading order cannot replace its background. Decorative icons sit
above the rail, do not cover values, and are omitted from narrow layouts.

World Quests is a separate native module with operator-managed definitions,
calendar occurrences and explicit local results. Its records use the application
database and are not supplied by the server-library importer. See
[World quests](news.md#world-quests) for publication, history and administration.

Description panels reuse the same table frame and native shadow layers, with
stacked title/description cards. Section navigation uses a shared small frame;
long introductions use the shared prose style. `headlineAchievements`,
`achievementGrade` and `backToTop` are optional external asset keys. Missing
artwork retains readable titles and working controls. Character showcases reuse
the table frame, bordered surface and grade symbols in both themes.

Achievement highscores use native point totals, independently of the selected
showcase or the sum of imported catalog entries. Missing totals rank as zero;
malformed totals are omitted. Ties use ascending player ID. Both themes share
the category registry, vocation filters and bounded pagination. The server caches
only point scalars for 30 seconds and coalesces concurrent refreshes. It reads
indexed keys in batches of 1,000 and excludes oversized scalar payloads before
loading them. Each request reads eligible player IDs in batches, sorts their
scores, then loads only the requested public profiles. Deleted characters,
staff and changed vocations are checked against current database values rather
than the points cache. No native gameplay values are written by this flow.

In the default theme, pages containing section navigation use document scrolling
through the intermediate shell containers. This lets sticky navigation work
without changing the scroll behavior of other pages. The temporary theme-preview
switch stays at the page top so it cannot cover a section link while scrolling.
