# Soundtrack

The Soundtrack page reads an operator-owned catalog and media directory outside
the repository. Classic and Legbone share the catalog, validation, playback URLs
and download behavior. The application never fetches another website's tracks as
a runtime fallback.

## Directory layout

Set the absolute media root in `.env`:

```env
SOUNDTRACK_ASSETS_ROOT=/var/lib/slender/soundtrack
```

The directory contains a versioned manifest and the referenced files:

```text
soundtrack/
  manifest.json
  soundtrack.zip
  audio/
    main-theme.mp3
  images/
    main-theme.jpg
```

`manifest.json` uses this format:

```json
{
	"version": 1,
	"archive": "soundtrack.zip",
	"tracks": [
		{
			"id": "main-theme",
			"title": "Main Theme",
			"audio": "audio/main-theme.mp3",
			"image": "images/main-theme.jpg"
		}
	]
}
```

Track IDs are stable lowercase identifiers. Audio supports MP3, Ogg, WAV, M4A
and FLAC; artwork supports PNG, JPEG, GIF and WebP. `image` and `archive` are
optional. Paths are relative, portable and may not escape the configured root.
Missing files remain local unavailable states.

Restart the website after changing `.env`. Replacing media files or the manifest
takes effect on subsequent requests. Media responses include validators and byte
range support so browsers can seek without downloading a whole track again. The
optional archive is exposed at the fixed `/library/soundtrack/download` URL.

## Page introduction

Create an administrator Static Page with the reserved slug `soundtrack` to add an
introduction above the catalog. It supports the normal Markdoc content and display
placeholders. The record stays out of the generic Library menu because the native
route owns it.

## Verification

- Open `/library/soundtrack` in Classic and Legbone.
- Play, pause, seek and change volume using mouse and keyboard controls.
- Start a second track and confirm the first pauses.
- Remove one optional image and one audio file and verify their local fallbacks.
- Request a byte range and verify `206`, `Content-Range` and the exact bytes.
- Replace a file and verify the ETag and returned content change.
- Remove the root setting and verify the page and media routes stay locally
  unavailable without external redirects.
