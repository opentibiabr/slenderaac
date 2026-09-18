# Install website assets

Classic artwork, animated outfits, animated items and game-store images are
separate ZIPs in the same fixed release channel, installed outside the checkout.
The same outfit, item and store files serve both layouts. You do not need to visit the visual
reference website, export pages, or import news to install the published images.

New installation? Start with [Getting started](getting-started.md) for the database
and application setup. [Layout settings](themes.md) explains the default and switcher.

## One-command installation

Use an updated SlenderAAC checkout and install its dependencies first. The installer
updates artwork, not application code. Store installation requires the external store
route included in the updated checkout; an older version is rejected before any files
are moved. Deploy the updated application code through your normal workflow before
restarting a production service. From the application root, run:

```sh
git pull
bun install --frozen-lockfile
npm run install:assets
```

The installer:

- downloads all four packages from the SlenderAAC release channel, with no provider-site fallback;
- checks the ZIP checksum, manifest, image hashes and archive paths;
- reuses a non-empty `THEME_ASSETS_ROOT`, or creates a sibling `<application-name>-theme-assets` folder; empty or whitespace-only values use the default, including a fresh `.env.dist`;
- sets `THEME_ASSETS_ROOT`, `OUTFIT_ASSETS_ROOT`, `ITEM_ASSETS_ROOT` and `STORE_ASSETS_ROOT` in `.env`, preserving unrelated settings;
- verifies every selected package before activating any of them;
- keeps the existing default layout and switcher setting, adding Classic/true only when absent.

The first run downloads one release archive per package. The walking outfit pack
alone contains more than 100,000 small PNG files. Installation can take several
minutes on a slower connection or disk. Progress is printed while each download runs and again when validation/staging
starts. This does not change the development command: restart the website afterwards
with `npm run dev`, or use the service command from your deployment.

Restart the website process, then choose **Layout → Classic**. To make Classic
the default, set `SLENDER_THEME=classic` in `.env` before restarting. Changing the
layout menu itself does not download the package.

To choose another external directory:

```sh
npm run install:assets -- --root ../theme-assets
```

`--root` takes priority over the process environment and `.env`. A non-empty path
inside the application checkout is rejected before downloading anything; choose an
external directory with the command above. A blank root does not mean the current
directory. The same rules apply to all four packages.

To install only selected packages (for example, to keep customized Classic artwork):

```sh
npm run install:assets -- --packs outfits items store
npm run install:assets -- --packs classic
```

In PowerShell, use `npm.cmd` instead of the `npm` PowerShell shim when passing
options, for example `npm.cmd run install:assets -- --packs classic`. The default
all-package command has no extra options and works as shown above.

The resulting directory is:

```text
theme-assets/
  classic/manifest.json
  tools/
  outfits/128/1_1_1_3.png
  items/3031.gif
  store/13/Category_Coins.png
```

`THEME_ASSETS_ROOT` points to the **parent**. Each other variable points to its
respective `outfits/`, `items/` or `store/` directory. Only selected variables are
updated. Previously configured sprite directories elsewhere are left untouched;
the installer switches their selected `.env` variables to the managed directories.
For Docker or a service manager, make that directory readable inside the runtime
and pass the corresponding runtime paths through all selected asset variables. A host `.env` edit
does not replace an environment variable already supplied by the container/service.

## Update and recovery

Run the same installation command to update. Identical installations are left
intact. When the package changes, the old selected directories stay
in a printed `backup-*` directory. A changed `.env` also gets a private adjacent
backup. Do not commit or share environment backups.

Package upgrades replace the managed directories, including any locally edited
artwork. Keep operator customizations separately and reapply them from the backup
after upgrading. Other directories under the asset root are left intact.
An existing `static/images/store` directory is moved into `backup-*/legacy-store`
outside the checkout so static middleware cannot hide updated release images.
An older `build/client/images/store` copy is also moved to `legacy-built-store`
in the same backup. Keep custom store artwork in the external directory after
installation, and install assets before your normal production deployment.

If activation fails, the installer restores the old directories and legacy store. It does not run
a build, database migration, content import or restart command.

## Fixed download links

- [Current asset packages](https://github.com/opentibiabr/slenderaac/releases/tag/classic-assets-latest)
- [Classic ZIP](https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-latest/classic.zip)
- [Classic SHA-256 checksum](https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-latest/classic.zip.sha256)
- [Outfits ZIP](https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-latest/outfits.zip)
- [Items ZIP](https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-latest/items.zip)
- [Store ZIP](https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-latest/store.zip)

`npm run install:assets` is the only supported automated installation path. This keeps
download validation, environment updates, activation and rollback in one implementation.
Each ZIP also has a matching `.zip.sha256` attachment.
The fixed channel has three files per pack: the JSON pointer used by the installer,
the ZIP for a stable direct download, and its checksum for manual verification.
GitHub adds the two source-code archive links automatically; they are not website
asset packages.
For manual installation, extract selected ZIPs outside the checkout, set their
corresponding `.env` variables and restart. Automated installs read one small
`<pack>-assets.json` file per package, pointing to an immutable versioned ZIP and
checksum. The repository-wide Latest release does not affect this channel.

## Images still missing?

Open `/theme-assets/classic/content/classic-border-1.gif` on your website. It must
return an image with HTTP **200**. A 404 usually indicates a missing file, a wrong
root, unreadable files, or a process that has not received the new environment.
Do not use `manifest.json` as the HTTP test: that file is intentionally private.

If this image works but the page still uses fallbacks, verify the installed
`classic/manifest.json` is valid and belongs to the matching package. Administrators
see a warning when the manifest cannot be loaded. Report the installer error,
this asset's HTTP status and the theme being viewed; never send the full `.env`.

The account table's Daily Reward and hidden-character symbols also come from the
Classic pack, even when Legbone is selected. If both layouts show fallback symbols,
check the pack's `accountRewardCollected`, `accountRewardUncollected` and
`accountCharacterHidden` manifest entries. If the symbols load but the status is
unknown, check the game server's Daily Reward cycle instead of reinstalling images;
see [account character status](ui-states.md#account-character-status).

Legbone's page background is bundled with the application at
`/images/background-artwork.jpg`. A missing background there calls for checking the
deployed application version and that URL; the external image installer does not
supply it.

Boosted creatures, bosses and player portraits use the outfit package installed
by the default command, configured through
`OUTFIT_ASSETS_ROOT`. They use the server database and `/api/outfits`; installing
the Classic ZIP supplies their pedestals and decoration. If portraits load but stay
still, update the application and run `npm run install:assets` again, then restart.
Older outfit packages contained only idle frames for many appearances. Updating
the Classic package also refreshes the prepared library portraits.

Maintainers: see [publishing and refreshing packages](classic.md#publishing-the-fixed-asset-channel).

## Store and animation checks

The published sprites target the current packaged client data (15.10 for the
outfit and item snapshots). IDs must match the game server's data; custom or newer
appearances may need an updated pack. The default outfit package includes walking
PNG sequences, including colors, addons, directions and mounted poses. An
appearance that has only one genuine frame still remains still; do not synthesize
movement. Animated item and store GIFs keep every frame, duration and loop setting.
Optional inventory placeholders and item-title metadata remain operator supplied.

Check these URLs after restarting the website:

- `/api/outfits?id=128` — JSON with multiple distinct rendered frames in the default pack.
- `/api/outfits?id=300` — another walking sequence, covering a formerly static creature.
- `/api/items?id=10329` — JSON containing a complete animated GIF, not a single extracted frame.
- `/images/store/64/Djinn_Lamp_Idle.png` — an animated image served as `image/gif` despite its catalog filename.

Confirm visible movement in both layouts, including boosted portraits and player
portraits after navigation. HTTP 200 or a nonempty image alone does not establish
that an animation works. Naturally static items, such as the basic gold coin, are
not suitable animation checks.

In the game server's `config.lua`, `coinImagesURL` must point at **your website**,
including the trailing slash and the port if needed:

```lua
coinImagesURL = "https://your-server.example/images/store/"
```

The installer does not edit the game server configuration or restart it. The
store package supplies artwork, not offers or purchases. Keep the catalog's
relative image names consistent with the package's `13/`, `32/`, `64/` and `home/`
directories. A missing catalog-specific image returns 404; there is no external
website fallback. Updating valid images changes their HTTP validators, allowing
clients to revalidate them.

## Server-owned sidebar content

The pack supplies frames and decorative artwork. Boosted selections and online
players come from the server database; polls and fansites use their admin records.
Captured counts, shop labels, poll questions and sidebar destinations never replace
these values. Twitch/YouTube audience counts show unavailable until an audience
provider supplies data; this does not hide the channel icons or configured links.

The screenshot page and daily teaser share `classic/reference/pages/screenshots.json`.
Replace sample images/captions with your own collection; keep each entry's positive
unique `id` stable when removing or reordering entries. Both layouts use the same
collection, and an empty collection hides the teaser.

For a server trailer, set `PUBLIC_TRAILER_URL` in `.env`. You can add an image such as
`classic/custom/server-trailer.png` outside the checkout and map the manifest's
`assets.serverTrailerPreview` to `custom/server-trailer.png`. Update the corresponding
manifest hash/version using the existing asset-pack workflow. Without that optional
image, or if it fails to load, the card shows a Play trailer action. Captured trailer
thumbnails are not a fallback. Keep this poster in sync with the configured video
and reapply operator customizations after a package upgrade.

## Renderer behavior

<details>
<summary>Outfit and item response contracts for maintainers</summary>

### Animated outfits

The renderer reads the requested outfit's PNG files directly. No generated metadata or cache marker is needed, and the sprite directory can be read-only. Replacing sprites takes effect on subsequent requests; browser responses are revalidated against their rendered content. Animations must contain consecutive frames starting at one, with at most 128 frames in a complete rider/mount loop. Missing optional outfits return `404` with no frames without interrupting character, account, or ranking pages. Invalid request parameters return `400`.

### Inventory items

Item requests accept numeric identities and the existing empty-slot names. Missing
or invalid optional images return a non-cacheable `404`; malformed identities
return `400`. Successful responses revalidate their complete image and title, so
replacing artwork or item names takes effect without restarting the app.
The optional `appearances.dat` and `appearances.proto` files provide item titles.
Missing or malformed title data leaves the image available with the client's
numeric fallback label.

Manual installations can still use the legacy `outfits_anim` and `items`
directories. Keep artwork outside version control; use the installer for new
installations so these files stay outside the checkout.

</details>
