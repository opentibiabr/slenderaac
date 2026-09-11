# Remaining page roadmap

This roadmap separates implemented website behavior from operator content and
game-server features. Classic and Legbone share routes, data, validation and
permissions. A matching shell or an unavailable message does not complete a
module. Complete the simplest independent website pages first.

## Current implementation pass

| Page family     | Status      | Completion checks                                                                                                                            |
| --------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Get Help / FAQ  | Implemented | Local categories, search, article navigation, actual view ordering, featured articles and administrator publication; both themes and mobile. |
| Parents' Guide  | Implemented | Editable local content, configured server identity, working local links and shared document typography.                                      |
| Legal Documents | Implemented | Index and selected operator documents, local footer/legacy links, explicit absent-content state; no copied third-party agreements.           |

## Next: no gameplay changes required

| Module             | Missing work / dependency                                               | Acceptance checks                                                                                        |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Genesis            | Operator-owned story/chapter publication and navigation.                | Persist edits, chapter/fragment navigation, empty state, shared document layout.                         |
| Fankit             | Curated operator artwork and a maintained downloadable package.         | Validated external files, download headers, missing/replaced assets, release/update flow.                |
| Soundtrack         | Operator-provided audio, track metadata and redistribution permissions. | Play/pause, keyboard controls, track changes, failed media, ranged downloads, no source-site fallback.   |
| Maps               | A render/export pipeline for the configured map and local map metadata. | Town/floor selection, coordinates, correct map identity, missing tiles, mobile pan/zoom.                 |
| World Boards       | Shared native forum boards, topics, posts and moderation.               | Authentication, author ownership, verified-account rules, publication, pagination and race-safe posting. |
| Trade Boards       | Category of the same forum module; no duplicated implementation.        | Board permissions and local topic/post navigation.                                                       |
| Community Boards   | Category of the same forum module.                                      | Public visibility, pinned/locked topics and moderation.                                                  |
| Support Boards     | Category of the same forum module.                                      | Posting permissions and local account/recovery links.                                                    |
| Guild Boards       | Forum integration with current guild membership.                        | Membership changes, private-content isolation, guild creation/disbanding and stale authorization.        |
| Staff Post Archive | Public archive of authorized staff posts from the forum.                | Historical staff attribution, filters/pagination and exclusion of private/deleted content.               |

## Requires game rules or authoritative integration

| Module                                | Dependency                                                                                                                                   | Acceptance checks                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Leaderboards                          | The configured server does not currently implement Drome rotations/results; its title integration still contains TODOs.                      | Real current/past rotations and scores; no substitution with level highscores or invented history.                |
| Wheel of Destiny Planner              | A versioned wheel definition and rule evaluator compatible with the configured server. A planner need not mutate the character's live wheel. | Vocation/level/budget gates, dependencies, reset, deterministic share/import codes and version mismatch handling. |
| Current Character Auctions            | Auction eligibility, character custody, escrow and authoritative server coordination.                                                        | Offline/online races, concurrent bids, funds, expiry, cancellation and settlement.                                |
| Auction History                       | Settled records from the same auction module.                                                                                                | Immutable outcomes, filtering and pagination.                                                                     |
| My Bids                               | Account-scoped bids from the same auction module.                                                                                            | Ownership, private maximum bids, outbid/settled states.                                                           |
| My Auctions                           | Seller management in the same auction module.                                                                                                | Ownership, eligibility, custody and cancellation deadlines.                                                       |
| My Watched Auctions                   | Account-scoped watch list for the same auctions.                                                                                             | Add/remove idempotency, ownership and expiry/deleted-auction handling.                                            |
| House bidding, transfers and move-out | Search/detail already exist. Actions need the game server to own updates; direct website writes would race its in-memory state/save cycle.   | Bids and private limits, funds, ownership, eligibility, server-save races, settlement and failure recovery.       |

## Existing page families

News/archive/events, server/organization introduction, screenshots, guides,
creature/boss/spell/achievement catalogs, experience table, world quests,
characters/worlds/highscores/online, guild/account management, shop, house
search/detail, polls, feedback, fansites and resellers already have local routes.
This inventory does not certify every edge case of those workflows. Some guide
presentation and gallery artwork still depend on the external pack.

## Completion rule for each family

- Inspect the public visual reference and its actions, then use local data and
  application-owned logic. Never use another site's application as a fallback.
- Reuse shared page frames and controls, keeping Classic CSS scoped. Freeze
  aligned shell/background geometry; compare matching viewport, scroll origin
  and state before scoring image differences.
- Record screenshots, component rectangles and pixel comparisons for Classic;
  distinguish data-dependent text/height from structural differences. Also test
  Legbone, keyboard access, empty/error states and a narrow viewport.
- Validate authorization and concurrency where applicable. Remove temporary
  fixtures and record only checks actually performed.
- Ship atomic commits, portable documentation and external artwork through the
  maintained asset package. Mark a module complete only when its frontend and
  backend behavior are implemented and tested; content readiness is separate.
