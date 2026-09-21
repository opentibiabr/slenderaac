# Polls

`/community/polls` lists active polls and closed polls in pages of 50 entries.
Players sign in to vote or inspect results. Login returns to the selected poll
and preserves the layout. Results show aggregate totals and the current account's
own choice; voter identities are not exposed.

New installations include an ongoing poll about preferred server activities.
Administrators can replace it through `/admin/polls`. The current-poll box on the
Classic homepage reads the newest open poll from the database and links directly
to its local voting form. It disappears when there is no open poll. The asset pack
supplies its frame and the optional `headlinePolls` title, not the question or votes.

## Administration and voting

- A poll has a title, description, opening date, optional closing date and between
  2 and 20 distinct options. Each player chooses one option per account.
- Dates use midnight UTC. Opening is inclusive and closing is exclusive. Drafts
  and future polls are hidden; closed polls remain in the history and reject votes.
- The question, description and options lock after the first vote. Publication
  and dates can still change. Create another poll to ask a different question.
- The server validates the option against the stored poll, rejects multiple
  choices and checks the rendered version. Database uniqueness and serializable
  transactions protect simultaneous votes and edits.
- A deleted account's vote remains in the total with no account reference.
  Administrators see aggregate results rather than a list of voter identities.

Polls and feedback share date validation, login return handling, topic tables and
the administration editor. Each module keeps its own records and response rules.
The migration adds `slender_polls` and `slender_poll_votes`; apply migrations and
regenerate the Prisma client during installation or updates.

## Validation

Run `bun test src/lib/polls.test.ts src/lib/feedback.test.ts` to check choices,
result aggregation, dates and shared validation. Exercise login, invalid choices,
duplicate/concurrent votes, closed/draft forms, pagination, admin question locking
and the homepage link in a local database. Check both layouts and mobile widths.
