# Classic layouts

These are [built-in SlenderAAC pages](news.md), available in the default theme
without an external pack. The pack supplies Classic presentation assets and optional
comparison content; it does not install routes or database features.

The theme renders Latest News (`/`), News Archive (`/news/archive`) and Event
Schedule (`/news/event-schedule`) through the same shell and content-frame family.
`layout.ts` chooses the news, compact and wider compact variants. `TableFrame`
owns caption rails and corners; `TableSurface` owns the table shadows. New pages
with the same structure should reuse these components before adding page CSS.
The shared wrappers in `src/lib/components/news/` select the default or Classic
presentation while keeping the same route data and controls.

`ContentFrame` delegates all page titles to `Headline`. Existing headline sprites
keep their measured native dimensions; dynamic titles share the external pack's
`headlineFont`, color, baseline and spacing. New pages inherit this automatically.
Do not prepend a decorative icon or introduce a page-specific heading font. The
pack includes an OFL-licensed uncial typeface for dynamic titles; it is an adapted
text treatment, not a claim of glyph identity with the fixed raster headlines.
Font binaries and their license remain in the external pack. The asset endpoint
also accepts TTF with its font MIME type; scripts, stylesheets, SVG and traversal
paths remain blocked.

Numeric frame/surface dimensions and the sprite border switch are Classic-only
calibration inputs. The default theme intentionally uses fluid cards and an
internally scrollable table surface instead of inheriting those pixel widths.

The Classic presentation keeps the reference's English navigation and article-action
labels alongside its English headline sprites and imported documents. Application
locale selection does not translate this source presentation; translating the
theme and its content pack together is a separate adaptation.

The information presentation covers six top-level documents and 19 Manual
chapters, alongside the three News pages and two library catalogs. The server
introduction and organization page are local components. Characters, highscores,
online players, guilds, account forms and checkout reuse native data and actions
with shared Classic panels and controls. These adaptations do not implement every
Library, Community, Forum, Account or Support module from the reference;
unsupported modules show a local unavailable state. A reference website is never
used as a fallback application destination.

`/library/creatures` and `/library/boostable-bosses` are also built in. They share
the catalog layout and the installed external catalog data in both themes. Creature
portraits open local detail views with previous/back/next navigation. Those views
currently show the catalog identity and portrait; additional creature descriptions
and combat data have not been imported. Boss portraits remain noninteractive,
matching the source catalog. Daily boosted selections come from the server database.
Portrait lookup also accepts noninteractive boss cards, so a local boosted boss
can display its artwork without acquiring a creature-detail link.
Without catalog data, these routes retain an honest local empty state.

`/library/spells` uses the [server library import](server-library.md), independently
of the presentation pack. It provides local list, filter and detail views from
server spell and rune definitions. Saved unavailable links upgrade to this route.
`CatalogHeading`, `CatalogFilters` and the list/form variants of `PagePanel` keep
the same table and control treatments reusable for other native catalogs.

All adapted reference links pass through the shared destination resolver, including
pack navigation, article links, footer links and boosted sprites. Known features
use their Slender routes; unsupported features use `/unavailable`. `/download`
uses the server's configured client download. This also applies to old asset packs:
updating a pack cannot restore navigation to reference application services.
Explicit external services such as configured downloads and social networks keep
their intended destinations.

The information strip fills the actual center column. Its width must follow
intrinsic content growth in Quickstart and wide Manual chapters instead of being
capped at the normal 865px column width. Compare the strip, content frame and
right rail together at both desktop widths; checking only the article can miss
a shortened strip above otherwise correct content.

The desktop compact shell uses a 5.5px offset with its 1263px centering width.
Reducing that offset to 5px shifts every foreground layer half a pixel relative
to the aligned background and reference text. The normal news, wide calendar and
narrow-viewport layouts retain their own measured positioning rules.

Desktop pages allow document-level horizontal scrolling when intrinsic content
exceeds the viewport. Keep the right rail's trailing 10px gutter in that scroll
area so the outer decoration remains accessible. Clip horizontal overflow only
in the mobile shell; content frames still contain their own decorative overflow
without adding internal scrollbars.

The Fansites header keeps its image's natural aspect ratio; the current native
sprite is 180x31px. Its 180x188px wrapper contains a separate logo frame at
top 31px and a 12px bottom rail. Do not stretch the header to fill the wrapper or
retain a fixed height from an older asset pack.

## Local setup

The registered theme ID, preview value, asset folder and CSS namespace are all
`classic`. Set `SLENDER_THEME=classic` to select it by default. An external
manifest may declare up to 16 optional `aliases` (for example `legacy-classic`)
for saved preview links or server configuration. Aliases cannot shadow registered
themes or resolve ambiguously. Preview aliases redirect to the canonical URL;
missing or invalid aliases retain normal fallback behavior.

`SERVER_NAME` supplies the server identity in navigation, headings, guides,
promotions and accessible labels. It uses the same server-side configuration as the rest of SlenderAAC, with
`OpenTibia` as a fallback for an empty value. `/about/company` describes OpenTibiaBR
and links to its projects. Both pages are built in; external packs cannot replace
their content. Older introduction URLs redirect locally and preserve the query.

The matching external updater prepares display text with `{{serverName}}` and
`{{serverWebsite}}` placeholders. Slender resolves them from `SERVER_NAME` and the
current website origin at render time. This also covers manual sections, table
captions, tooltips, gallery captions and imported news. Identifiers, image paths,
link destinations and fragment anchors remain unchanged. Configuration values
are escaped before insertion into rendered Markdown. Keep the application and
asset pack versions together when upgrading; refresh local comparison fixtures
with the matching importer, which preserves their IDs across text normalization.

Classic renders the configured name in the existing logo slot by default. A
server-owned `serverLogo` asset can replace that text, and `serverShopButton` can
supply a custom shop button label. Without these assets, the shared components
render the current server name as text, so artwork cannot override its identity.
The default theme's desktop and mobile headers use the same configured name and
optional `serverLogo` from its own pack. Both headers link home and preserve the
active theme preview.

New application routes inherit the compact Classic frame and shared native form
styles by default. Only the home page uses the news layout. News tools and adapted
information pages retain their dedicated inner components. Add an optional native
headline mapping when a matching raster asset is available; otherwise new titles
use the shared dynamic heading treatment.

The category-upgrade migration preserves the previous first news category as
`server`. Fresh installations create the neutral category directly. Existing
comparison content should be refreshed with the matching pack importer so image
paths use the active pack. Keep the external import identity prefix when upgrading
to update existing fixture records rather than create duplicates.

Apply the repository migrations and generate the Prisma client through the usual
application setup. The news migration adds types, categories and optional imported
presentation to `News`, and introduces `ScheduleEvent` with inclusive UTC dates.
Existing news default to type `news` and category `community`.

Extract the separately distributed theme ZIP outside the checkout. Set
`THEME_ASSETS_ROOT` in the server environment to the directory containing
`classic/manifest.json`, then start the normal dev server. Verify an actual
asset such as `/theme-assets/classic/content/classic-border-1.gif`; the manifest
itself is intentionally not a public endpoint.

Normal routes read published content from the database. `/admin/news` edits news,
ticker and featured articles, categories, dates and publication status.
`/admin/events` edits event ranges, descriptions, colors, seasonal display, order
and publication. Both use the existing administrator authentication hook.

The external ZIP includes `tools/update-classic-assets.py`, a PowerShell wrapper,
`export-classic-source.js`, `import-classic-content.mjs`, focused tests and their README. Assets, captured
public content and source maps stay in that pack. The updater prepares a ZIP,
SHA-256 checksum and change report. The optional importer uses stable IDs and the
application's existing Prisma client against a local test database. Follow the
pack README for the single-command refresh/import workflow and its prerequisites.

The updater checks dimension changes for every reused native image, including
images referenced only by news or information documents. Preparation reports
those changes; `--apply` rejects them before writing active files. Changed bytes
with the same dimensions remain eligible for activation. A calibrated asset can
be reclassified as native only after byte comparison proves its source URL;
record its URL, SHA-256 and dimensions so offline refresh can reuse it. The
Fansites supported frame required this provenance correction even though its
displayed pixels were already correct.

For offline calendar refreshes, supply the saved Latest News capture and all
installed information captures, then apply each captured month in turn with
`--calendar`. Existing month grids are retained. `--pages-only` updates information
documents and does not update the calendar. Import the resulting content once
after merging the months. `--package-only` then packages current runtime files,
tools and tests without downloading or importing again. Raw HTML captures and
obsolete unreferenced images are excluded from the ZIP.

From the extracted pack root, the focused tool checks are:

```sh
python tools/test-update-classic-assets.py
node --test tools/test-export-classic-source.mjs
```

These use temporary fixtures without accessing the application database or
network. The Python checks cover geometry reporting, rejected activation,
same-size updates, missing offline sources and catalog ordering/link validation;
the Node checks cover calendar
sections, entities and inert handler parsing.

Run `bun test src/lib/source-navigation.test.ts` from the application checkout to
check local reference destinations, deep links, preview retention and configured
external downloads independently of the installed asset pack.

## Presentation and navigation

Imported articles use a validated presentation tree rendered through shared
Svelte components. Only the supported tags and presentation attributes survive;
source scripts, handlers and arbitrary inline CSS are not executed. Title/date
edits preserve the presentation and same-day ordering. Editing the body replaces
the imported presentation with the normal Markdoc renderer.

The pack's presentation data supplies current promo assets/text, menu destinations,
sidebar links and calendar colors. The footer identifies SlenderAAC and OpenTibiaBR.
Routes with local equivalents remain
local; public modules without an equivalent use the local unavailable page.
Internal preview links preserve `themePreview` and the active comparison flags.
Keep that state across server redirects and submitted forms as well as anchors.
Account authentication redirects retain the preview on the login URL and local
return destination. Highscore filters and pagination retain skill, vocation,
page size and preview parameters. Clearing a guild search removes only `search`,
preserving other query parameters and the fragment.

The development-only `classicReference=1` flag explicitly loads external Home/Archive
fixtures; `classicDemo=1` loads the captured calendar month. Without those flags, both
pages exercise the database. Calendar dates use UTC; its timestamp uses Berlin
time with the correct daylight-saving abbreviation. Archive defaults cover the
last 30 days, normalize invalid day/month combinations and swap inverted ranges.

Historical calendar navigation is an intentional Slender capability: January
2000 through December of the following year remain addressable. The official
current-month view may omit its previous-month link. Preserve local history
access rather than remove it or shift the calendar title to imitate that state.

Calendar descriptions retain plain-text section boundaries from the external
capture: a heading line, a bullet paragraph and a blank line before the next
section. The exporter decodes supported named and numeric entities without
executing handlers or inserting their HTML. Preserve these newlines through
reference validation, database import and rendering; flattening them destroys
the section structure. Shared `Tooltip` renders native heading/text spans using
the existing paper, `helperArrow` and `contentOrnament` assets. Calendar panels
remain within the theme root but outside clipped table cells, so opening a
helper does not require changing table geometry. Premium helpers continue to
use the same component with their own measured presentation.

`MediaDialog` supplies shared news-image and trailer previews. News thumbnails
retain full-size asset links as fallbacks, while normal activation opens the
image over the current article. The trailer uses the external `trailerFrame`
(775x447px) and `trailerClose` (45x45px) sprites. Closing by button, backdrop or
Escape restores focus; the video iframe is removed to stop playback. Modified
link activations retain normal browser behavior. Media URLs are restricted to
local theme assets or recognized HTTPS YouTube destinations. Keep this behavior
separate from the query-driven Screenshots gallery and its previous/next controls.

## Visual verification

### Built-in information pages

`src/lib/information.ts` registers native destinations. The shared link helper
maps matching official URLs to these routes and preserves query parameters,
anchors and preview flags. Menu groups expand for the active information page.
Additional pages should extend this catalog and reuse the document renderer and
frame rather than add parallel loaders or copy source HTML into the repository.

`/about/screenshots` adds the screenshot gallery. The external document supplies
captions, thumbnails, full images and the card texture. Native Svelte controls
open a dialog, wrap previous/next navigation and support arrow keys and Escape.
`currentscreenshot=<id>` opens a selected image directly, including links from
the right sidebar. Gallery navigation preserves the preview and browser history.

`/about/game-features` reuses the compact document frame, native heading rhythm
and sprite-based bullet list. Captured account-creation buttons become local
navigation actions; they never submit the original site's form. The reusable
action component reads normal/hover sprites from the external document.

`/about/premium-features` uses the shared table frame and shadow surfaces for
the benefit comparison. The external converter turns known helper text into
native tooltips with mouse, focus and Escape support; original handlers are never
executed. The green Premium action navigates to the local shop.

`/about/company` uses built-in OpenTibiaBR information in both themes, with links
to the organization, documentation, SlenderAAC issue tracker and public projects.
It reuses the contact and compact table variants. Asset packs cannot override
this page or the application's footer identity; refreshing artwork never replaces
the organization with source-site company details.

`/guides/quickstart` uses the common document layout and numbered marker sprites.
Its minimum desktop body width follows the native 1020px client illustration.
Account links use local signup, download links use `PUBLIC_DOWNLOAD_URL`, and
guide references retain section queries and fragment anchors.

`/guides/manual` provides the contents and 19 allowlisted `section` destinations
through the same route. Chapters use external `manual-<section>.json` documents.
The updater derives each chapter's minimum body width from its images and list
insets. Native previous/contents/next links and named anchors retain the preview.
Manual styles cover nested lists, image spacing, legacy float breaks and the
shallow table variant without changing the approved news table components.
The Gamewindow legend distributes its lists with `space-evenly`. Explicit
`ul.IndentedList` padding must win over the generic nested image-list rule.
Ordinary Manual cells preserve supplied `valign` attributes and use content-box
sizing for fixed numeric widths; overriding these with global middle alignment
or border-box sizing changes wrapping despite identical outer table bounds.

`/guides/security-hints` reuses the common headings and sprite-based lists.
Inline image alignment retains the source line height instead of accumulating
extra spacing between hints. External security-provider links remain external;
Reference account recovery uses the local account flow.

The external document format is version 1: page ID, local headline image with
native dimensions, and a bounded tree of supported text/presentation elements.
The server rejects unknown elements, oversized documents, invalid image URLs and
paths escaping the external pack. The renderer filters attributes again. No
source JavaScript, event handlers or arbitrary styles are executed.

The pack updater accepts repeated `--page ID=HTML` captures. `--pages-only` updates
those pages while retaining the existing news presentation. A full update also
refreshes the information pages already present in the pack. Use captures from a
validated browser if direct public-page requests encounter a challenge.

### Native application pages

Character search/profile, highscores, online players, guilds, account forms and
checkout use existing Slender data and actions. `PagePanel` selects shared Classic
`TableFrame`/`TableSurface` presentation, while the default theme retains its own
layout. Extend those wrappers for future pages with the same structure before
adding route-specific CSS. Theme-specific native controls are scoped to Classic.

Experience Table is a native Library page in both themes. It calculates levels
1–3500 from the server's integer experience progression and renders four groups
of 875 levels. `TableColumns` reuses the shared caption, rail and inner surfaces;
its groups stack on smaller screens. Compact numeric tables share their cell
borders, row cadence, alternating colors and right alignment through the native
theme stylesheet. Additional column shadows belong to each inner surface and do
not alter the outer frame or the existing sprite-based table shadows.

Register newly implemented modules in `site-pages.ts`. That registry supplies
navigation, the native headline and upgrades saved `/unavailable?feature=...`
links to their local destination. Query parameters and preview state survive the
upgrade. Browser navigation also preserves fragments; server redirects do not
read fragments because those are absent from HTTP requests. Unimplemented
modules remain explicit gaps and must not redirect to an external application.

The Experience Table pass verified every displayed level against the reference,
the 833px desktop frame, 22px rows, numeric glyph positions and a 390px viewport
without horizontal overflow. Browser export resampling can change pixels even
when CSS colors and text boxes agree; record the usable viewport width separately
from the requested width before comparing captures.

Keep permission gates and backend validation when adapting forms. Highscore
labels may be translated, but submitted skill values remain canonical. Product
and payment radios use separate names; currency changes clear an offer that is
no longer available. Missing or invalid item artwork keeps a readable item
identifier and cannot interrupt hydration or display a stale response.

The subsequent native-page pass checked the shared heading wrapper against an
unchanged Characters central-region capture; its pixels were identical. New
server and organization titles were checked separately with the loaded shared
font. Narrow-viewport checks cover the selected pages and do not imply that every
business module has complete visual or end-to-end coverage.

### Capture and interaction checks

Capture both sites freshly in the same viewport before changing shared geometry.
Keep full captures, same-origin crops, amplified differences and DOM measurements.
Some browser screenshot exports are resampled; record their actual pixel sizes
and use DOM/Range coordinates to distinguish export differences from layout drift.
Compare background-only areas first and keep a matching background fixed.
Record the scroll origin before exporting a fixed overlay: a full-page capture
can paint the modal at its viewport position plus the pre-capture scroll offset.
Translate comparisons by that recorded origin only; matching native image sizes
do not prove that viewport and document coordinates have the same origin.

Recursive presentation renderers must preserve text-node boundaries. A newline
between template comments and a recursive loop can add visible spaces before
links, bold text and otherwise empty named anchors. Keep the formatting directive
adjacent to the loop and recheck rendered text after formatting. Do not compensate
with broad font or padding changes. Explicit image presentation dimensions also
take precedence over natural size when the reference specifies them: the news
fixes illustration is displayed at 243x200px although its native height is 199px.

Archive table calibration must include the inner surface and its right shadow.
A 7px shortfall in the adapted border-box stack was hidden by overflowing fixed
desktop tracks and moved the narrow Category column 4px left. Restore the surface
width before tuning the remaining column distribution, retaining the outer frame
and shell. Compare glyph-only label ranges as well: the source category labels
include a 4.6875px leading blank after the icon, while a 3px replacement margin
moves the visible text. Normalizing the label string does not trim its DOM Range.

Review all three news layouts after a shared change. Check desktop widths and the
mobile menu, article images and horizontally scrollable tables. Treat live
counters, rotating promotions, fansite logos and timestamps separately from their
frame geometry. Use `classicGrid=1` to show the non-interactive alignment grid.

Exercise archive filters, draft visibility, old article/ticker links, ticker
expansion, browser back/forward, calendar month/year boundaries and admin edits.
Builds are separate from this visual and runtime review.

### Initial September 2026 comparison

The initial comparison captured 30 page states at 1919x945, before replacing the
server introduction and organization document with local components. After the
shared corrections, the 27 information documents matched measured document
dimensions and content-image geometry, with no stable-shell flags or matched
glyph-position differences greater than 2px. Glyph pairing uses unique normalized
labels and excludes ambiguous duplicates; equal boxes alone are not a claim of
complete pixel identity.

Seven representative states were also compared at 1145x945: Latest News, News
Archive, About Server, Quickstart, Premium Features, Manual Interface and
Controls. The final archive pass rechecked both widths after correcting its inner
surface and category spacing. A later official calendar capture encountered a
Cloudflare challenge and was excluded from parity evidence; valid earlier
captures supported its desktop comparison.

The captured information-page action inventory contains 68 forms adapted to
native actions, 35 Premium helpers and 39 screenshot gallery entries. Each has a
local counterpart. News adds seven clickable full-size illustrations and the
trailer action. Include handler-bearing images and their nearest action ancestor
when counting controls: an anchor around a floated image can have a zero-size
box while the image remains clickable. Named fragment targets are not actions.

Runtime checks exercised guild search/clear, account-to-login preview retention,
highscore filter/page-size state, gallery keyboard wrap and Escape, Premium
helper dismissal, news-image closing with focus restoration, trailer iframe
removal and all five ticker expand/collapse controls. These checks cover the
selected behavior of existing backend pages; they do not establish complete
visual parity or end-to-end coverage for every business module.

Archive filtering returned only the selected ticker type and opened the matching
ticker. All nine shared menu groups toggled, and the inspected internal shell
links retained the preview. Calendar checks covered month navigation, combined
event descriptions in database/reference modes, Escape and panel flipping near
the narrow viewport edge.

Some fragment defects also exist in the public source. Observed examples include
the Manual contents link `achievements#achievementpointspoints` while its target
is `achievementpoints`, a Communication link to absent `support#tutorialhint`,
and a duplicated `startinggame` anchor. Distinguish these source defects from
links lost during conversion. Preserve the observed source mapping in the parity
pass; any correction needs a separate navigation decision rather than an
invented target.

At that stage, the refreshed pack retained all 27 information documents and both fresh
September/October calendar grids. ZIP integrity, all 454 packaged image hashes,
the bundled tool files and seven focused exporter/updater tests were checked.
The grids and canonical dates within each captured month retain the source text
including section breaks and bullets. Binary assets, source captures and local
comparison artifacts remain outside versioned application files.

## Native creature catalogs

Creature and boss entries now come from the configured server library, with
optional portraits supplied by the external pack in both themes. Their captured
presentation documents no longer determine the available entries or details.
See [Server library](server-library.md) for import, identity and data contracts.

The shared `CatalogHeading` has a portrait variant for this family: a 64px slot
on the left, a title aligned right, and 18px text under Classic's 12px body font.
`CatalogNavigation` supplies local previous/back/next links. The heading starts
40px below the navigation row; the first paragraph starts 76px below the heading.
Creature cards occupy 100x110px, with labels starting 67px below the card top.
Do not let the inline image baseline increase the 64px detail heading to 67px.
