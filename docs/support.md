# Support pages

Support routes share their backend and content across Classic and Legbone. Run
`bun migrate` and `bun generate` when updating an existing installation. The
migration adds fourteen editable answers and a parents' guide; it does not
replace an existing parents' guide or create legal agreements.

## FAQ

Open `/support/get-help`. Readers can select one of six topics, search titles and
answers, and open articles. Search requires every word to match, shows twenty
results per page, and excludes drafts. Empty results and invalid/missing URLs are
handled explicitly. Hot Topics contains published articles marked as featured.
Most Viewed FAQ uses actual article visits, not sample counts; an empty list is
normal on a new installation. Visits are recorded after an article mounts, not
when navigation preloads it. A one-hour same-site cookie limits repeated refreshes.
These approximate counters are for navigation, not analytics or accounting.

Administrators open `/admin/help` to create, edit, publish, feature or delete
articles. Titles, slugs, topics and answer length are validated on the server.
Duplicate slugs and stale edits/deletes are rejected. Viewing an article does not
change its editorial timestamp. Only published articles appear publicly.

Use Markdown, local links such as `/account` and `/download`, and
`{{serverName}}` for the configured name. Review default answers when changing
account, payment or client-download behavior. Do not publish credentials or
private support records as FAQ content.

## Parents' guide and legal documents

Use **Admin → Static Pages** to edit these reserved slugs:

| Slug                | Public route                 | Initial content                                      |
| ------------------- | ---------------------------- | ---------------------------------------------------- |
| `parents-guide`     | `/support/parents-guide`     | Editable guide with local links and section anchors. |
| `service-agreement` | `/support/service-agreement` | Operator must supply the agreement.                  |
| `privacy-policy`    | `/support/privacy-policy`    | Operator must supply the policy.                     |
| `rules`             | `/pages/rules`               | Existing server rules.                               |

`/support/legal-documents` links to the agreement, rules and privacy policy.
Absent documents display an explicit unpublished-content message. The Static
Pages **hide** setting only removes a page from the library menu; it does not make
a document private. Static Pages are trusted administrator-authored content.

The guide uses standard Markdown heading IDs, for example
`### Introduction {% #introduction %}`, and links such as `[Introduction](#introduction)`.
Keep anchor IDs stable when editing headings. The shared document renderer handles
typography and theme-aware local links, so future document pages can reuse it.

## Artwork and validation

Install or update the [external asset package](classic-assets.md) for Classic
headlines and optional FAQ icons. The new icons are shared with Legbone. Missing
icons retain category text and working links; application data stays in the
website database. Do not commit artwork or external reference captures.

For each change, exercise search, article/back navigation, publication and stale
edits in both themes. Compare Classic with the same viewport and scroll origin;
keep shared shell/background geometry unchanged. See the [remaining page roadmap](page-roadmap.md)
for larger modules and server dependencies.

For a read-only local HTTP smoke test, start the development site on port 5173,
then run `RUN_SUPPORT_INTEGRATION=1 bun test src/lib/server/help.integration.test.ts`.
In PowerShell, set `$env:RUN_SUPPORT_INTEGRATION='1'` before the `bun test` command.
The normal test run skips this check. It reads the public routes, invalid queries,
legal redirects and anonymous administrator access without changing database rows.
