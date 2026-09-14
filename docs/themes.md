# Choose a layout

SlenderAAC includes **Legbone** and **Classic**. They use the same accounts,
characters, news and game data. Changing layout changes presentation and does
not create another website or database.

For a first installation, follow [Getting started](getting-started.md). For
missing images or package updates, use [Install website assets](classic-assets.md).

## Change the current layout

Use the **Layout** menu at the top of the website. It is enabled by default and
stays available while scrolling. The selection keeps the current page, filters
and anchors. The server validates the selection and stores it in an HTTP-only
browser-session cookie. Links and forms need no theme
parameter; old bookmarks using `themePreview` still work and redirect to a clean
URL. A new browser session starts with the configured default.

## Set the default

Edit `.env` in the application folder:

```dotenv
SLENDER_THEME=classic
SLENDER_THEME_SWITCHER_ENABLED=true
```

Use `legbone` instead of `classic` for the other default, then restart the website.
An existing browser preference still takes priority while switching is enabled;
use the menu to change that session or open a new browser session to check the
default. For a production installation, follow its normal build and restart flow.

## Lock a single layout

```dotenv
SLENDER_THEME=classic
SLENDER_THEME_SWITCHER_ENABLED=false
```

After restarting, the server hides the menu, ignores and clears any stored browser
preference, and removes layout/comparison parameters from page URLs. Selection
URLs cannot bypass the lock. Set `true` to allow switching again. An absent or
blank switcher setting also enables it; other explicit values disable it.

`PUBLIC_THEME` controls the existing Skeleton/Tailwind color theme. It does not
select the layout. Use `SLENDER_THEME` for that choice.

## Images and server identity

Classic's decoration comes from its [external asset pack](classic-assets.md).
Without the pack, pages retain working controls and neutral fallbacks; only
administrators see asset configuration warnings. Install the pack for the full
appearance. Changing a theme setting alone does not install it.

Both layouts share the configured server name and operator logo. The optional
`serverLogo` asset in the external Classic manifest supplies that logo to both
layouts, independently of which one is selected. An absent or failed image uses
the configured name. Keep customized artwork outside the code repository and
reapply it after a package upgrade.

For page implementation, manifest fields and verification, see
[Classic layout contracts](classic.md) and [shared theme contracts](theme-contracts.md).
