# Slender AAC

This project is a website for the [Canary](https://github.com/opentibiabr/canary) project. The main goal is to use modern technology to have something that is easy to maintain and extend. It is also meant to be efficient, secure and easy to deploy.

## Website roadmap

FAQ, Parents' Guide and Legal Documents are implemented in Classic and Legbone.
The next priority is website-only work, followed by modules that need game rules
or authoritative server integration.

- [Page roadmap — status, priorities and expandable details](docs/page-roadmap.md)
- [Support pages — setup and content editing](docs/support.md)
- [Feature discussion](https://github.com/luan/slenderaac/issues/24)

---

<details>
<summary><h2>Getting started</h2></summary>

### Requirements

- [Node.js](https://nodejs.org/en/)
- [Bun](https://bun.sh/)
- [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/)
  - Running a database compatible with `canary`

### Installation

Clone this repository and install the dependencies:

```bash
git clone https://github.com/luan/slenderaac.git
cd slenderaac
bun install
cp .env.dist .env
```

Edit `.env` with your server and desired settings. Then migrate the database using the command below. Note that this assumes your current database already has the `canary` schema imported.

```bash
bun migrate:resolve
bun migrate
bun generate
```

Latest News, News Archive, Event Schedule and their administrative editors are
included in this setup and available in the default theme. No separate page
creation, theme assets or sample-content import is required. See
[built-in news and events](docs/news.md) for routes and content management.
The [support pages guide](docs/support.md) covers FAQ articles, the parents’ guide
and operator-owned legal documents.

### Running

At this point you should be ready to run the server:

```bash
bun dev
```

</details>

<details>
<summary><h2>Deployment</h2></summary>

Deployment depends highly on your server setup. Assuming you are on a Linux dedicated server or VPS. You need the following:

- [Nginx](https://nginx.org/en/)
- [Node.js](https://nodejs.org/en/)
- [Bun](https://bun.sh/)

As well as a database compatible with `canary`. You can use either [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/).

### Installation

```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
sudo apt install -y nginx
```

Clone this repository and install the dependencies:

```bash
git clone https://github.com/luan/slenderaac.git
cd slenderaac
bun install
cp .env.dist .env
```

### Nginx

We're just using Nginx as a reverse proxy. You can use any other web server that supports reverse proxying if you'd like. The Nginx configuration is as follows (adjust port and domain as needed if you're not using the defaults):

```nginx
server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name _;

        location / {
                   proxy_pass http://127.0.0.1:3000;
                   proxy_http_version 1.1;
                   proxy_set_header Upgrade $http_upgrade;
                   proxy_set_header Connection 'upgrade';
                   proxy_set_header Host $host;
                   proxy_cache_bypass $http_upgrade;
       }
}
```

### Building

Because we're now in a production environment, we need to build the project. This will generate the static files that will be served by the nodejs server. This is a one time step, you only need to do this again if you change /update the code.

```bash
bun generate
bun build
```

### Migrating the database

At this point you should be ready to migrate the database. This will create the necessary tables and columns. Note that this assumes your current database already has the `canary` schema imported.

```bash
bun migrate:resolve
bun migrate
```

### Running

Finally, we need to run the server, this will run on port 3000 by defaul, which is what we configured Nginx to proxy to.

```bash
NODE_ENV=production node -r dotenv/config build
```

</details>

<details>
<summary><h2>Client config</h2></summary>

Using your favorite method to edit the client (see [this tutorial](https://docs.opentibiabr.com/others/tutorials/infrastructure#client-with-notepad++-1) for help). Set the login webservice url to http://localhost:5173/api/login (or your appropraite server URL). This will make the client use the AAC to login.

</details>

<details>
<summary><h2>Animated outfits</h2></summary>

Run `python src/scripts/theme_assets.py install` from the application root to
install Classic, outfits, items and store images together. To install only
outfits, use `install --packs outfits`. The installer downloads the verified pack
from the [SlenderAAC assets release](https://github.com/opentibiabr/slenderaac/releases/tag/classic-assets-latest)
and configures `OUTFIT_ASSETS_ROOT`. See the [mini tutorial](docs/classic-assets.md).
Restart the website afterwards. Manual installations can still use the default
`outfits_anim` directory; keep artwork outside version control.

The renderer reads the requested outfit's PNG files directly. No generated metadata or cache marker is needed, and the sprite directory can be read-only. Replacing sprites takes effect on subsequent requests; browser responses are revalidated against their rendered content. Animations must contain consecutive frames starting at one, with at most 128 frames in a complete rider/mount loop. Missing optional outfits return `404` with no frames without interrupting character, account, or ranking pages. Invalid request parameters return `400`.

</details>

<details>
<summary><h2>Inventory Items</h2></summary>

The same installer includes animated item GIFs. Use
`python src/scripts/theme_assets.py install --packs items` for just this package.
It configures `ITEM_ASSETS_ROOT` outside the checkout. Manual installations can
still use `items`. Artwork is distributed through the same SlenderAAC release
channel and remains separate from the application's code license.

Item requests accept numeric identities and the existing empty-slot names. Missing
or invalid optional images return a non-cacheable `404`; malformed identities
return `400`. Successful responses revalidate their complete image and title, so
replacing artwork or item names takes effect without restarting the app.
The optional `appearances.dat` and `appearances.proto` files provide item titles.
Missing or malformed title data leaves the image available with the client's
numeric fallback label.

</details>

<details>
<summary><h2>Game store assets</h2></summary>

Use `python src/scripts/theme_assets.py install --packs store` or the default
all-package command. Store images are downloaded from the SlenderAAC release,
installed outside the checkout and served through `/images/store/...` using
`STORE_ASSETS_ROOT`. Existing `static/images/store` artwork is retained in an
external backup. Set the game server's `coinImagesURL` to your website's
`/images/store/` URL and restart the website after installation. See the
[store setup and checks](docs/classic-assets.md#store-and-animation-checks).

</details>

<details>
<summary><h2>Theme layouts and external asset packs</h2></summary>

SlenderAAC supports server-side layout shells through the theme registry. The current themes are `legbone` and `classic`.

See [Classic news layouts](docs/classic.md) for the shared page components, local content management, external pack updater and visual verification workflow.

Use `SLENDER_THEME` to select the server-side layout shell:

```env
SLENDER_THEME=legbone
```

or:

```env
SLENDER_THEME=classic
```

The shared **Layout** menu is enabled by default, including when
`SLENDER_THEME_SWITCHER_ENABLED` is absent. It switches between registered layouts
on the current page, retaining filters and anchors. The choice persists for the
browser session and applies to navigation and form submissions. A valid
`themePreview` URL takes precedence over that preference; new browser sessions
start with `SLENDER_THEME`.

To hide the menu and enforce a single layout, set both values in `.env` and restart
the app:

```env
SLENDER_THEME=classic
SLENDER_THEME_SWITCHER_ENABLED=false
```

The server then ignores and clears the browser preference and removes preview
parameters from page URLs. Direct preview URLs cannot bypass the lock. Use
`true` to enable switching again; blank or absent values enable it, while other
explicit values disable it.

`PUBLIC_THEME` controls existing Skeleton/Tailwind colors, not layout selection.
The server sends only the selected layout ID and whether switching is enabled;
environment configuration remains private.

### External assets

For installation or updates, follow the [website assets mini tutorial](docs/classic-assets.md).
With Python 3.10+ available, run this from the application root:

```sh
python src/scripts/theme_assets.py install
```

It downloads the [current Classic, outfit, item and store packages](https://github.com/opentibiabr/slenderaac/releases/tag/classic-assets-latest),
verifies them, installs them outside the checkout and configures `.env`. Restart the
website afterwards. Use `python3` instead of `python` if that is your runtime's name.

Theme-specific binary assets must not be committed to this repository. Mount or deploy them outside the repo and point `THEME_ASSETS_ROOT` to that directory:

```env
THEME_ASSETS_ROOT=/var/lib/slender/theme-assets
```

Example `classic` asset pack layout:

```text
/var/lib/slender/theme-assets/classic/
  manifest.json
  images/
  backgrounds/
  buttons/
  icons/
  menu/
  boxes/
  frames/
  content/
  strings/
  themeboxes/
```

`manifest.json` must include `schemaVersion`, `name`, `version`, and `assets`. `hashes` is optional.

```json
{
	"schemaVersion": 1,
	"name": "classic",
	"version": "2026.05.26",
	"assets": {
		"logo": "images/logo.png",
		"background": "backgrounds/background.webp",
		"menuOrnament": "icons/menu-ornament.png",
		"contentOrnament": "icons/content-ornament.png",
		"themeBoxOrnament": "boxes/box-ornament.png"
	},
	"hashes": {
		"images/logo.png": "sha256-example"
	}
}
```

Only `png`, `jpg`, `jpeg`, `gif`, `webp`, `ico`, and `ttf` files are served by `/theme-assets/[theme]/[...path]`. Asset paths are validated before public URLs are generated, and the endpoint rejects traversal, dotfiles, backslashes, null bytes, directories, blocked extensions, and symlinks that escape the theme root.

`classic` works without an asset pack and falls back to neutral placeholders. Missing or invalid asset pack warnings are only shown to admins.

The deployment operator is responsible for confirming asset rights and authorization. Keeping reference-style assets outside the MIT repository keeps the code repository clean, but it does not remove legal risk from deploying or distributing those assets.

For local visual review, a `classic` pack can contain official/reference-style pieces such as the page background, logo, menu icons and labels, blue button sprites, content frame borders, news headline strips, topbar social/status icons, right-side theme boxes, trailer/screenshot previews, and shop/poll panels. These files must remain external to the repository. Before production distribution, either obtain authorization for those assets or replace/modify them with assets the deployment operator is allowed to use.

### Acceptance checklist

- `SLENDER_THEME=legbone` keeps the existing visual and flows.
- `SLENDER_THEME=classic` works without external assets.
- `SLENDER_THEME=classic` works with a mounted external asset pack.
- Asset endpoint attacks using `..`, encoded traversal, backslashes, null bytes, dotfiles, symlink escape, directories, and blocked extensions fail.
- No MyAAC PHP/Twig/CSS/JS is copied into this repository.
- No reference-style binary assets are committed to this repository.

</details>

<details>
<summary><h2>Screenshots</h2></summary>

### Homepage (as admin)

<img width="1210" alt="image" src="https://github.com/luan/slenderaac/assets/223760/1c5c7a62-6f1e-4405-87f3-25b546a78e41">

### Login page after registration

<img width="1194" alt="image" src="https://github.com/luan/slenderaac/assets/223760/5befad19-f367-4df4-86f9-f602bcd34340">

### Account page (unverified)

<img width="1183" alt="image" src="https://github.com/luan/slenderaac/assets/223760/7213755e-2672-4d77-aa9f-2a775fb668f5">

### Verification email

<img width="571" alt="image" src="https://github.com/luan/slenderaac/assets/223760/3ecbdc70-886f-45aa-843b-d992f6d838a8">

### Static page

<img width="1188" alt="image" src="https://github.com/luan/slenderaac/assets/223760/bd4ca3b6-a282-47f5-892b-31de7a5cad17">

### Shop 1

![Slender](https://github.com/luan/slenderaac/assets/223760/6d8c6d49-2eda-474b-8d43-b7313fae2a4b)

### Shop 2

![Slender (1)](https://github.com/luan/slenderaac/assets/223760/35a4a106-45fd-4093-8e20-ca37a9297d5f)

### Shop (video)

https://github.com/luan/slenderaac/assets/223760/1b88dae4-dcbf-401e-a46e-64655e094cc1

### Highscores

![Slender | Highscores](https://github.com/luan/slenderaac/assets/223760/cb7dd1b7-be1d-40f9-9272-5329213b20e2)

### Character search

https://github.com/luan/slenderaac/assets/223760/a2cb7aad-a3df-46a2-b284-1f38a910fcbf

### Guilds

![Slender | Guilds (1)](https://github.com/luan/slenderaac/assets/223760/b8f5e2ea-d04f-4fb8-87a7-fa7a0fe06476)
![Slender](https://github.com/luan/slenderaac/assets/223760/04958dcf-931b-46c3-80de-f7c71f005b94)
![Slender (2)](https://github.com/luan/slenderaac/assets/223760/a6ccf9d9-9802-4a67-bf77-125af02a7672)
![Capture-2023-06-16-195438](https://github.com/luan/slenderaac/assets/223760/a38c60de-9f33-4005-b278-1e0552c53b14)
![Capture-2023-06-16-195453](https://github.com/luan/slenderaac/assets/223760/06271632-6f46-4aef-b87e-e9e912af7138)
![Capture-2023-06-16-195510](https://github.com/luan/slenderaac/assets/223760/353eea86-56a1-4c83-b1c7-8fec38dec0d9)
![Slender (3)](https://github.com/luan/slenderaac/assets/223760/520fd041-12b8-4d63-bfad-547450e73bc3)
![Capture-2023-06-16-195556](https://github.com/luan/slenderaac/assets/223760/b71aeb1d-ccbd-4324-87e9-97ed95e8379f)

</details>

## Tech stack

- [Svelte](https://svelte.dev/)
- [SvelteKit](https://kit.svelte.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [SkeletonCSS](https://skeleton.dev)
- [TailwindCSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Bun](https://bun.sh/)

## Contributing

Contributions are welcome! Please open an issue or pull request. Be sure to post screenshots and logs of any issues you're having.

## License

MIT
