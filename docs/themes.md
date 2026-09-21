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

## Adding another layout

The current two-layout PR has implemented the profile, renderer and context
boundary in the [theme extension roadmap](theme-extension-roadmap.md). Route data,
actions, permissions and server loads stay shared; only the selected profile and
registered presentation components vary. The roadmap records the boundary check,
test-only third-theme fixture and remaining repository-wide validation gate.

### Extension recipe

Use this order for a real third layout:

1. Add one profile entry in `src/lib/themes/profiles.ts`. Declare only the
   asset packs, news limit, scroll policy and presentation capabilities the
   layout actually uses. Do not add a speculative capability.
2. Add the static shell and renderer implementations under
   `src/lib/themes/<id>/`. A renderer may be reused from another layout only
   through an explicit registry entry.
3. Complete every property in `ThemeComponents` and add the definition to
   `src/lib/themes/registry.ts`. The TypeScript contract must fail if a
   renderer is missing; there is no implicit Legbone fallback.
4. Let the root layout publish the definition through the existing theme
   context. Routes should consume semantic wrappers and profile capabilities;
   they must not import a concrete theme renderer or compare an ID.
5. Add a test-only fixture first, run `npm run check:themes`, then validate
   both existing layouts before adding the new ID to the production selector.

The smallest safe change set is therefore a profile, a shell, a complete
registry entry, focused renderer tests and visual evidence for the page families
the new layout supports. The backend, database, actions, permissions and route
loads stay shared.
