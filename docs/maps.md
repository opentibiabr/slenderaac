# Maps

The Maps page publishes an operator-owned world overview, region directory and
optional area artwork from outside the repository. Classic and Legbone share the
same catalog, local media routes and selected-area behavior.

## Directory layout

Set the absolute map root in `.env`:

```env
MAP_ASSETS_ROOT=/var/lib/slender/maps
```

Example layout:

```text
maps/
  manifest.json
  images/
    world.jpg
    world-full.png
    capital.jpg
```

`manifest.json` uses percentages for optional overview hotspots:

```json
{
	"version": 1,
	"overview": "images/world.jpg",
	"highResolution": "images/world-full.png",
	"sections": [
		{
			"title": "Main Continent",
			"groups": [
				{
					"label": "Cities",
					"places": [
						{
							"id": "capital",
							"name": "Capital",
							"description": "The central city of {{serverName}}.",
							"x": 48.5,
							"y": 42,
							"image": "images/capital.jpg"
						}
					]
				}
			]
		}
	]
}
```

`id` values are stable lowercase identifiers used by `?area=...`. `x` and `y`
must either both be absent or both be percentages from 0 through 100. Overview,
area and high-resolution artwork supports PNG, JPEG, GIF and WebP. Relative paths
may not escape the configured root; missing files produce local unavailable
states.

Create an administrator Static Page with the reserved slug `maps` to replace the
default introduction. The native route supports normal Markdoc display
placeholders and keeps this record out of the generic Library menu.

## Verification

- Open `/library/maps` in Classic and Legbone and inspect the complete page.
- Follow every region link and matching overview hotspot.
- Verify invalid area IDs return a local `404`.
- Remove overview and area artwork and verify the explicit local fallbacks.
- Download the high-resolution file and compare it with the configured source.
- Replace artwork and verify its ETag and response content change.
- Check the region directory and map at a narrow viewport with keyboard focus.
