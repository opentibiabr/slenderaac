# Feedback forms

`/community/feedback` lists published forms that are currently open. The default
installation includes **Server Feedback**, an ongoing two-question form. Players
sign in to answer a form; the login redirect preserves the selected form and
layout. The page title and table use the shared theme components, and
`headlineFeedbackForm` is an optional title asset in the external Classic pack.

Administrators manage forms and read responses at `/admin/feedback`. These routes
use the existing administrator authorization, checked against the current account
type in the database. Players see a submission confirmation; other players cannot
read their answers.

## Publishing and responses

- Each form has a title, description and up to 20 required text questions, entered
  one per line. Text is rendered as text rather than executable HTML.
- Opening and optional closing dates use midnight UTC. Opening is inclusive;
  closing is exclusive. An unpublished or future form is hidden. A closed form
  cannot receive answers. Leave closing empty for an ongoing form.
- Each account can answer a form once. A database uniqueness constraint and a
  serializable transaction prevent simultaneous submissions from creating
  duplicates. Answers are limited to 2,000 characters each and 10,000 combined.
- A rendered form includes its update version. A submission from an older version
  is rejected so the player can review the current questions before answering.
- Questions become immutable after the first response. Create another form to ask
  different questions. Titles, descriptions, publication and dates remain editable.
- Administration displays 25 responses per page. Deleting an account clears its
  account reference while retaining its feedback for administrators.

The migration adds `slender_feedback_forms` and `slender_feedback_responses` and
seeds the default form. Apply the repository migrations and regenerate the Prisma
client through the normal installation/update process. This module stores its
own content in the application database and does not import external responses.

## Validation

Run `bun test src/lib/feedback.test.ts` for schedule boundaries, malformed question
definitions, answer limits and administrator input validation. When changing the
submission flow, also exercise login return, required answers, duplicate and
simultaneous submissions, closed/draft forms, private response access and editing
questions after a response. Check both layouts and a narrow viewport.
