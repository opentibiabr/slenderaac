# Install Classic assets

The Layout menu selects the theme. Its images are a separate release package,
installed outside the application checkout. You do not need to visit the visual
reference website, export pages, or import news to install the published images.

## One-command installation

Use a SlenderAAC checkout that includes Classic and Python **3.10 or newer**.
From the application root, run:

```sh
python src/scripts/theme_assets.py install
```

On systems where Python is named `python3`, use that command instead of `python`.
The installer:

- downloads the current package from the fixed Classic release channel;
- checks the ZIP checksum, manifest, image hashes and archive paths;
- reuses `THEME_ASSETS_ROOT`, or creates a sibling `<application-name>-theme-assets` folder;
- sets the absolute `THEME_ASSETS_ROOT` in `.env`, preserving other settings;
- keeps the existing default layout and switcher setting, adding Classic/true only when absent.

Restart the website process, then choose **Layout → Classic**. To make Classic
the default, set `SLENDER_THEME=classic` in `.env` before restarting. Changing the
layout menu itself does not download the package.

To choose another external directory:

```sh
python src/scripts/theme_assets.py install --root ../theme-assets
```

The resulting directory contains `classic/manifest.json` and `tools/`.
`THEME_ASSETS_ROOT` points to their **parent**, not to `classic/`.
For Docker or a service manager, make that directory readable inside the runtime
and pass the runtime's absolute path as `THEME_ASSETS_ROOT`. A host `.env` edit
does not replace an environment variable already supplied by the container/service.

## Update and recovery

Run the same installation command to update. Identical installations are left
intact. When the package changes, the old `classic/` and `tools/` directories stay
in a printed `backup-*` directory. A changed `.env` also gets a private adjacent
backup. Do not commit or share environment backups.

Package upgrades replace the managed directories, including any locally edited
artwork. Keep operator customizations separately and reapply them from the backup
after upgrading. Other directories under the asset root are left intact.
If activation fails, the installer restores the old directories. It does not run
a build, database migration, content import or restart command.

## Fixed download links

- [Current Classic package and installer](https://github.com/opentibiabr/slenderaac/releases/tag/classic-assets-latest)
- [Download ZIP](https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-latest/classic.zip)
- [SHA-256 checksum](https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-latest/classic.zip.sha256)
- [Standalone installer](https://github.com/opentibiabr/slenderaac/releases/download/classic-assets-latest/install-classic-assets.py)

The standalone script works with `python install-classic-assets.py install --app <application-directory>`.
For manual installation, extract the ZIP outside the checkout, set the parent
directory in `.env`, and restart. Automated installs read a small fixed-channel
JSON file that points to a versioned archive and checksum. Other application or
optional-artwork releases cannot change which package this channel selects.

## Images still missing?

Open `/theme-assets/classic/content/classic-border-1.gif` on your website. It must
return an image with HTTP **200**. A 404 usually indicates a missing file, a wrong
root, unreadable files, or a process that has not received the new environment.
Do not use `manifest.json` as the HTTP test: that file is intentionally private.

If this image works but the page still uses fallbacks, verify the installed
`classic/manifest.json` is valid and belongs to the matching package. Administrators
see a warning when the manifest cannot be loaded. Report the installer error,
this asset's HTTP status and the theme being viewed; never send the full `.env`.

Boosted creatures, bosses and player portraits also require the separate
[outfit sprite pack](../README.md#animated-outfits), configured through
`OUTFIT_ASSETS_ROOT`. They use the server database and `/api/outfits`; installing
the Classic ZIP supplies their pedestals and decoration. A portrait with only one
animation frame will remain still. Check the sprite pack when these portraits
are missing but the theme borders and background load correctly.

Maintainers: see [publishing and refreshing packages](classic.md#publishing-the-fixed-asset-channel).

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
