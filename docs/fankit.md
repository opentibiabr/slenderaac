# Fankit

The Fankit page publishes an operator-owned ZIP from a local file. Classic and
Legbone use the same route, metadata and download handler. The ZIP remains outside
the source checkout and is never fetched from another website at request time.

## Configure the package

Create a ZIP containing the artwork the operator is allowed to distribute and
place it outside the repository. In `.env`, set `FANKIT_FILE` to that ZIP's
absolute path on the host running the website. Use forward slashes for a Windows
path. The value is specific to each installation; do not copy a path from another
server.

Restart the website after changing `.env`. `/fankit` then displays the archive
name, size and modification date; `/fankit/download` serves it as a ZIP download.
Missing, relative, empty, linked or non-ZIP files produce an explicit unavailable
state and a local `404` download response.

The response includes a fixed attachment fallback name, UTF-8 filename metadata,
content length, modification date and ETag. Replacing the configured file updates
the metadata and cache validator without changing the public URL.

## Edit the introduction

The page works without a database record. To replace its default introduction,
create a Static Page in the administrator area with the reserved slug `fankit`.
The normal Markdoc content and `{{serverName}}` and `{{serverWebsite}}` display
placeholders are supported. This reserved page stays out of the generic Library
menu because it is published through `/fankit`.

## Release checklist

- Confirm the artwork and redistribution rights belong to the operator.
- Open `/fankit` in Classic and Legbone and verify the package metadata.
- Download the file and compare it with the configured ZIP.
- Replace the ZIP and verify the public URL returns the new ETag and content.
- Temporarily remove the setting and verify the page and download show their
  unavailable states without redirecting elsewhere.
