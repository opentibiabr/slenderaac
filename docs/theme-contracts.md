# Website and theme contracts

These contracts apply to Classic, Legbone and future layouts. A theme owns
presentation; SlenderAAC owns routes, information, permissions and actions.
New pages inherit the shared behavior below. A matching frame alone does not
make a page complete.

## Where each contract lives

| Concern | Detailed contract |
| --- | --- |
| Frames, typography, page families, navigation and measured geometry | [Classic layouts](classic.md) |
| Loading, zero, empty, offline, unavailable, error and stale data | [UI states and data accuracy](ui-states.md) |
| Installation, updates, fixed downloads and recovery | [Website assets](classic-assets.md) |
| Asset preparation and publication | [Publishing the fixed asset channel](classic.md#publishing-the-fixed-asset-channel) |
| Native catalogs, game configuration and data boundaries | [Server library](server-library.md) |
| News, guides and editable information | [News and content](news.md), [Support](support.md) |
| Implemented pages and remaining dependencies | [Page roadmap](page-roadmap.md) |

Keep detailed rules in their owning document. Update that document when behavior
changes; historical capture notes are evidence for their recorded conditions,
not universal dimensions or proof of the current implementation.

## Shared structure and native behavior

- Reuse the existing route, server load/action, authentication and data validation
  in every theme. Do not implement a second backend inside presentation components.
- Resolve theme selection on the server with validated IDs/manifests and the
  static component registry. Never construct component imports from user input
  or expose server-only asset configuration to select a theme.
- Choose an existing page family before adding page CSS. Reuse `ContentFrame`,
  `Headline`, `MenuLabel`, `PagePanel`, `TableFrame`, `TableSurface` and existing
  controls where they own the pattern. A shared problem belongs in that owner;
  introduce a page-specific variation only for a demonstrated structural difference.
- Keep Classic styles scoped. Check inner forms, captions, tables, buttons,
  validation messages and dialogs as well as the outer shell so default-theme
  styling cannot leak into an otherwise themed page.
- Share content semantics and parsing. For example, news drop caps, rich text,
  links and image failure handling must remain usable in both layouts. Each
  layout may style the same content without duplicating its renderer or data.
- Ship built-in routes and required schema/default records through normal
  installation and upgrades. An asset ZIP must not be needed to install a route,
  permission or database feature. Preserve operator-created content on upgrades.
- Treat reference markup and captured data as isolated comparison fixtures.
  Adapt visual structure and interactions to native components and local data
  before delivery. Never ship a whole captured page as the feature, and never
  enable captured content merely because `themePreview` selects Classic.

Every visible value needs an identifiable owner: local database/configuration,
operator-published content, presentation artwork, or an explicit development
fixture. Boosted selections, rankings, audience counts, polls, promotions and
community directories must not silently read yesterday's captured values.
Decorative images may be static; a live selection must still follow its data.

Actions that affect gameplay require an authoritative server integration and its
permission/concurrency checks. Do not simulate bidding, transfer, ownership or
other game actions with direct database edits merely to make a button work.
Until supported, keep the limitation explicit and track it in the roadmap.

## Identity and navigation

Use the existing server-side configuration for the public server name, including
navigation, headings, guides, tooltips, image alternatives and imported prose.
Do not hardcode a sample name or introduce a second configuration reader for a
theme. `/about/company` describes OpenTibiaBR. Keep source-provider branding out
of repository-owned presentation names, identifiers and documentation.

Identity substitution is a display operation. Preserve native lookup keys,
protocol identifiers, stored IDs, asset paths and URL fragments; escape configured
values before inserting them into rich text. Do not perform a repository-wide
string replacement that changes those contracts or third-party attribution.

The logo is shared identity: use the shared `serverLogo` data and `ServerBrand`
component in both layouts, including mobile. Themes own its slot dimensions and
styling; they must not maintain separate logo copies or different fallback logic.
Dynamic menu/page titles inherit their common font, color, shadow and baseline.
Keep the full configured name accessible when its visual label is truncated.

Inventory actual actions, not just visible labels. Include menu and footer links,
linked images, boosted portraits, banners, table rows, sorting, filters, pagination,
forms and back links. Reference application destinations must resolve to the
corresponding local feature through shared navigation handling. A missing feature
stays locally unavailable; neither the reference website nor an unrelated local
page is an acceptable fallback. Review older asset-pack links too. Explicitly
configured social, organization and client-download services may remain external.

Preserve filters, fragments and the active layout across internal navigation,
redirects, forms, reloads and browser history. The shared layout switcher is
enabled by default. `SLENDER_THEME` sets the default and
`SLENDER_THEME_SWITCHER_ENABLED=false` enforces it on the server, clearing browser
overrides without discarding page filters. Hover/preload must not select a layout.
Share selection logic while adapting the control's appearance to each theme.

## Visual and interaction stability

Before changing a pixel, compare the same page and state using the actual content
viewport, browser, zoom, device-pixel ratio, scrollbar mode and scroll origin.
Capture full viewports before making crops; record crop origins and asset versions.
Do not compare a desktop screenshot with a narrow integrated-browser viewport
and compensate for that difference in CSS.

Establish background scale and placement first. Then compare foreground edges
both to the viewport and to stable artwork landmarks. If many elements share a
delta, inspect their common container. Once the background is correct, do not move
it to conceal foreground errors, add arbitrary page offsets, or alter a matching
layer while fixing another.

Preserve the [viewport and scrollbar invariant](classic.md#viewport-and-scrollbar-invariant).
The root stable gutter prevents short/long content or expanded menus from shifting
the centered site. Do not hardcode a scrollbar width, use a compensating shell
offset, hide overflowing content or bypass the geometry guard to obtain a match.
The information strip follows the real center-column width for its page family.

Render sprites and banners with their measured intrinsic proportions. Diagnose
missing assets, font loading, alpha bounds, doubled borders/shadows and fractional
ancestor coordinates before changing size or color. Do not stretch artwork or
sharpen it artificially to compensate for the wrong composition. Compare glyphs
and paint layers after box geometry, separating dynamic text from fixed chrome.

Interaction must preserve orientation and component identity:

- Legbone opens the current menu section on first load/reload, preserving manual
  toggles during navigation. Carets remain visible with long labels and scrollbars.
- Its desktop sidebar scrolls independently while route content may return to the
  top. Do not disable document scrolling globally to preserve a menu position.
  Mobile keeps the drawer behavior.
- The shared layout switcher remains reachable while scrolling without moving
  calibrated desktop columns or obscuring navigation.
- Key repeated records by stable identity. Equivalent route data must not remount
  portraits, discard decoded frames or replay loading/intro effects. Real source
  changes must still cancel obsolete work and update the image.
- Keep loading/error indicators within their established slots. Clean up timers,
  subscriptions and obsolete requests; do not let an old search undo a new filter.
- Preserve keyboard activation, focus, labels and disabled semantics. Color or
  an unexplained icon alone must not carry a status. Check supported translations
  and long names without redesigning the approved Classic composition.

Follow [UI states and data accuracy](ui-states.md) for every dynamic surface.
Confirmed zero, empty results, service Offline and unavailable/stale data have
different meanings. A server-status refresh does not turn page-load database
snapshots into live player subscriptions.

## External artwork and installation

Keep theme, outfit, item and store binary packs outside Git, served through the
existing validated local asset endpoints. Do not expose filesystem roots to the
browser. Share outfit/item/store files across layouts and use the maintained
Python installer instead of introducing parallel setup scripts.

Install published packs from the application's fixed release channel; do not
fall back to source-provider downloads at install time or during page rendering.
Maintainer source preparation is separate from operator installation. Keep the
README linked to the [one-command tutorial](classic-assets.md#one-command-installation).

Retain versioned ZIPs, checksums and fixed pointers. Verify every selected package
before activation; preserve unrelated environment settings and unselected packs,
back up replaced directories and restore them after a failed activation. Check
application compatibility before moving legacy static store files. Installation
does not imply a build, migration, content import, restart or game-config edit.

Preserve catalog filenames, actual MIME types and animation. A GIF behind a
`.png` URL must not lose its frames; an outfit with one real idle frame is not a
failed download. Validate actual image responses and rendered behavior in both
themes, including missing-asset fallbacks, rather than checking ZIP existence only.

## Evidence and completion

For a shared fix, inspect the affected callers and representative page families
in both layouts. Include long/short content, menu expansion, navigation and relevant
loading/error states. For a requested page-by-page audit, record each route and
action checked, including content below the fold. Representative checks alone do
not establish site-wide coverage.

Use focused regression checks for recurring failures: shared geometry, menu scroll,
stable portrait sources, status freshness and installer activation/rollback.
Keep capture conditions with visual evidence so a later change can reproduce the
comparison. Run only validation permitted by the repository/task build policy;
mark runtime, build or integration checks not performed as unverified.

The [roadmap definition of done](page-roadmap.md#definition-of-done) separates
frontend, backend, content/assets and server dependencies. An unavailable page,
matching screenshot or populated fixture is not a completed module. Record
remaining work with its dependency and observable acceptance criteria.

Keep fixes atomic and attach relevant screenshots to visual pull requests.
Resolve review findings only after a correction or an evidence-backed false
positive assessment. Public documentation and delivery metadata must stand on
their own, use portable links, and contain no machine paths, credentials or
private tooling references. Keep temporary captures, raw reference excerpts and
fault-injection fixtures out of commits and normal production behavior.
