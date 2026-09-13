# Community directories

`/community/fansites` lists the server's promoted and supported fansites. The
directory reads `slender_directory_entries`; names, partner websites, languages,
contacts and descriptions belong to this installation. New installations include
the OpenTibiaBR community resource, which administrators can edit or remove.

Administrators manage entries through `/admin/directories`. Drafts are hidden.
Publishing an entry makes it visible immediately. Changes and deletion check the
version that the administrator opened, preventing an older form from overwriting
a newer edit. Deletion also requires the explicit removal checkbox.

## Fansites

Language, social-media and content filters accept multiple selections. Choices
within one group are alternatives; different groups combine. Selecting a language
in a fansite row toggles the same filter. Clearing one group keeps the others and
the chosen layout. Filters are regular links and work without JavaScript.

The partner logo opens its configured HTTP(S) website. Contact characters link to
the local character page and must exist when saved. If a character is later
deleted, its name remains plain text. Content and social icons describe the
fansite; their labels do not imply a separate link.

The Classic sidebar uses the first published featured fansite, ordered by promoted
status, name and ID. It disappears when none is available. Its “View all Fansites”
button always opens the local directory.

## Images and presentation

Logo and item fields accept asset keys from the external theme manifest, rather
than file paths or remote image URLs. Logos retain their proportions inside a
150 × 100 slot; item images use 32 × 32. Missing images fall back to the partner's
name or the item's description. Keep the external asset pack outside Git.

The Classic pack can provide `headlineFansites`, `directory-no-filter`,
`directory-social-<name>` and `directory-content-<name>`. Other layouts retain
accessible labels when these optional assets are unavailable. Shared table frames,
surfaces and small panels own their borders and spacing. On narrow screens only
the wide directory tables scroll horizontally.

## Resellers

`/community/resellers` lists published partners for the selected country. The
country selector is built from configured partners, uses English country names
and preserves its selection and layout in the URL. A valid country without
partners shows an empty result. Draft entries do not add countries to the menu.

Choose the Resellers directory in the shared editor and provide at least one
two-letter country code. Address, telephone, mobile phone, email and contact text
are optional. Empty fields are omitted. Websites open the partner's site; email
addresses provide a mail link. No commercial partners are seeded automatically.
The directory does not create payment orders or grant server currency.

`AutoSelectForm` submits when the selection changes and keeps an explicit submit
button available without JavaScript. `PropertyTable` renders the contact rows,
while `PagePanel`'s `details` variant owns the compact stack spacing. The optional
`headlineResellers` image uses its native 192 × 32 title slot.

## Installation and validation

Apply migrations and regenerate the Prisma client when updating. The directory
migration creates its table and default community resource without changing game
accounts or players.

Run `bun test src/lib/directories.test.ts` for URL and metadata validation, filter
composition and editor value preservation. In a local database, also exercise
administrator permissions, publication, stale edits, deletion, the featured
sidebar, both layouts and narrow-screen table scrolling.
