# Website page roadmap

Track the remaining website pages and the work needed to complete each one.
Classic and Legbone share routes, data, validation and permissions.

**Completed in the latest pass:** FAQ, Parents' Guide and Legal Documents.

**Next priority:** simple website pages that need no gameplay changes.

**Separate dependency:** operator content, media and authoritative game rules.

## Contents

- [Completed support pages](#completed-support-pages)
- [Next: website-only work](#next-website-only-work)
- [Game rules and server integration](#game-rules-and-server-integration)
- [Existing page families](#existing-page-families)
- [Definition of done](#definition-of-done)

---

## Completed support pages

- [x] **Get Help / FAQ** — categories, search, articles and administrator publication.
- [x] **Parents' Guide** — editable local content and configured server identity.
- [x] **Legal Documents** — local index, document selection and footer links.

See the [support pages guide](support.md) for setup and editing. Legal routes are
implemented; the operator still needs to supply the agreement and privacy policy.

<details>
<summary>Completed behavior and validation scope</summary>

- **FAQ:** local categories, search, article navigation, actual view ordering,
  featured articles and administrator publication in both themes and on mobile.
- **Parents' Guide:** editable local content, configured server identity, working
  local links and shared document typography.
- **Legal Documents:** index and selected operator documents, local footer and
  legacy links, and an explicit absent-content state. No copied third-party
  agreements.

</details>

---

## Next: website-only work

These modules can be implemented without changing live gameplay. Some still need
operator-provided content or an export pipeline. Expand a module for its completion
criteria.

### Content and downloads

- [ ] **Genesis** — publish the operator's story and chapters.
- [ ] **Fankit** — offer curated artwork in a maintained download.
- [ ] **Soundtrack** — play the operator's published audio tracks.
- [ ] **Maps** — display the configured map with town and floor selection.

<details>
<summary>Genesis — content and chapter navigation</summary>

**Required:** operator-owned story/chapter publication and navigation.

**Complete when:** edits persist, chapter and fragment links work, empty content
has a clear state, and pages reuse the shared document layout.

</details>

<details>
<summary>Fankit — artwork and downloadable package</summary>

**Required:** curated operator artwork and a maintained downloadable package.

**Complete when:** external files are validated, download headers are correct,
missing or replaced assets are handled, and the release/update flow works.

</details>

<details>
<summary>Soundtrack — audio and track controls</summary>

**Required:** operator-provided audio, track metadata and redistribution permissions.

**Complete when:** play/pause, keyboard controls, track changes, failed-media states
and ranged downloads work. Never fall back to another site's media application.

</details>

<details>
<summary>Maps — map export and navigation</summary>

**Required:** a render/export pipeline for the configured map and local metadata.

**Complete when:** town/floor selection, coordinates, correct map identity, missing
tiles and mobile pan/zoom are covered.

</details>

### Shared forum

Build one forum module and reuse it across these destinations:

- [ ] **World Boards** — boards, topics, posts and moderation.
- [ ] **Trade Boards** — trade categories and board permissions.
- [ ] **Community Boards** — public topics, pinning and locking.
- [ ] **Support Boards** — protected posting and local recovery links.
- [ ] **Guild Boards** — private boards tied to current guild membership.
- [ ] **Staff Post Archive** — public archive of authorized staff posts.

<details>
<summary>Forum completion criteria</summary>

- **World Boards:** authentication, author ownership, verified-account rules,
  publication, pagination and race-safe posting.
- **Trade Boards:** board permissions and local topic/post navigation, using the
  same forum implementation.
- **Community Boards:** public visibility, pinned/locked topics and moderation.
- **Support Boards:** posting permissions and local account/recovery links.
- **Guild Boards:** membership changes, private-content isolation, guild
  creation/disbanding and stale authorization.
- **Staff Post Archive:** historical staff attribution, filters/pagination and
  exclusion of private or deleted content.

</details>

---

## Game rules and server integration

These modules need compatible game definitions or an authoritative update path.
A matching layout alone does not complete them.

### Rankings and character planning

- [ ] **Leaderboards** — real current and past Drome rotations/results.
- [ ] **Wheel of Destiny Planner** — versioned definitions and compatible rules.

<details>
<summary>Leaderboards — rotation and score data</summary>

**Dependency:** the configured server does not currently implement Drome
rotations/results; its title integration still contains TODOs.

**Complete when:** current/past rotations and scores come from real results.
Do not substitute level highscores or invent historical records.

</details>

<details>
<summary>Wheel of Destiny Planner — definitions and rule evaluation</summary>

**Dependency:** a versioned wheel definition and rule evaluator compatible with the
configured server. A planner need not mutate the character's live wheel.

**Complete when:** vocation/level/budget gates, dependencies, reset, deterministic
share/import codes and version mismatch handling are covered.

</details>

### Character auctions

Build one auction module with these views:

- [ ] **Current Character Auctions** — eligibility, custody, bids and settlement.
- [ ] **Auction History** — settled records and immutable outcomes.
- [ ] **My Bids** — account-scoped bids and their current state.
- [ ] **My Auctions** — seller management and cancellation rules.
- [ ] **My Watched Auctions** — account-scoped watch lists.

<details>
<summary>Auction dependencies and completion criteria</summary>

**Shared dependency:** auction eligibility, character custody, escrow and
coordination with the authoritative server state.

- **Current Character Auctions:** offline/online races, concurrent bids, funds,
  expiry, cancellation and settlement.
- **Auction History:** settled records from the same module, immutable outcomes,
  filtering and pagination.
- **My Bids:** ownership, private maximum bids and outbid/settled states.
- **My Auctions:** ownership, eligibility, custody and cancellation deadlines.
- **My Watched Auctions:** add/remove idempotency, ownership and handling of
  expired or deleted auctions.

</details>

### House actions

- [ ] **Bidding, transfers and move-out** — authoritative updates and settlement.

House search and detail pages already exist.

<details>
<summary>House actions — ownership and server-save safety</summary>

**Dependency:** the game server must own updates. Direct website writes would
race its in-memory state and save cycle.

**Complete when:** bids and private limits, funds, ownership, eligibility,
server-save races, settlement and failure recovery are covered.

</details>

---

## Existing page families

These families already have local routes:

- **News:** latest news, archive and event schedule.
- **Information:** server/organization introduction, screenshots and guides.
- **Library:** creatures, bosses, spells, achievements, experience table and world quests.
- **Community:** characters, worlds, highscores, online players, guilds, polls,
  feedback, fansites and resellers.
- **Account and shop:** account management and shop flows.
- **Houses:** search and detail pages.

This inventory does not certify every edge case. Some guide presentation and
gallery artwork still depend on the external pack.

---

## Definition of done

Apply the [website and theme contracts](theme-contracts.md) and this checklist to
every page family:

- [ ] Inspect the public visual reference and its actions; implement behavior using
      local data and application-owned logic. Never use another application as a fallback.
- [ ] Reuse shared frames and controls. Scope Classic CSS and preserve aligned
      shell/background geometry.
- [ ] Compare matching viewport, scroll origin and state. Record screenshots,
      component rectangles and pixel comparisons for Classic; distinguish
      data-dependent text/height from structural differences.
- [ ] Test Legbone, keyboard access, empty/error states and a narrow viewport.
- [ ] Trace dynamic values to their local/configured source; verify zero, offline,
      unavailable and stale states where applicable. Audit image/banner links,
      redirects and forms for local destinations and layout/filter retention.
- [ ] Verify required routes/schema/default records through the maintained install
      or upgrade path. Keep operator content separate from comparison fixtures.
- [ ] Validate authorization and concurrency where applicable. Remove temporary
      fixtures and record only checks actually performed.
- [ ] Ship atomic commits, portable documentation and artwork through the maintained
      external asset package.

Mark a module complete only when its frontend and backend behavior are implemented
and tested. **Content readiness is a separate status.**
