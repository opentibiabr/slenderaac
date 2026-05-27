# Slender AAC

This project is a website for the [Canary](https://github.com/opentibiabr/canary) project. The main goal is to use modern technology to have something that is easy to maintain and extend. It is also meant to be efficient, secure and easy to deploy.

[Features / Roadmap](https://github.com/luan/slenderaac/issues/24)

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

You'll need to download the spritesheet from [here](https://docs.opentibiabr.com/opentibiabr/downloads/website-applications/applications#animated-items-and-outfits) and place it in `outfits_anim`. These assets are not included in the repository because they can cause the repo to bloat, and are also not release under the same license as the code.

</details>

<details>
<summary><h2>Inventory Items</h2></summary>

You'll need to download the spritesheet from
[here](https://docs.opentibiabr.com/opentibiabr/downloads/website-applications/applications#animated-items-and-outfits)
the items in `items`. These assets are not included in the repository
because they can cause the repo to bloat, and are also not release under the same license
as the code.

</details>

<details>
<summary><h2>Game store assets</h2></summary>

Anything you put into the `static` folder in this repo will be served by the server. This is useful for storing assets for the game store. For example, you can put a `static/images/store` folder and then reference the images in the store using `/images/store/my-image.png`. For instance, you can use the store assets made available in the [canary docs](https://docs.opentibiabr.com/others/downloads/website-applications/applications#store-for-client-13)

</details>

<details>
<summary><h2>Theme layouts and external asset packs</h2></summary>

SlenderAAC supports build-time layout shells through the theme registry. The current themes are `legbone` and `cip-slender`.

Use `SLENDER_THEME` to select the server-side layout shell:

```env
SLENDER_THEME=legbone
```

or:

```env
SLENDER_THEME=cip-slender
```

`PUBLIC_THEME` may still be used by existing Skeleton/Tailwind `data-theme` behavior, but it is not the runtime layout selector. Layout selection is resolved on the server from `SLENDER_THEME` and only the selected theme id is sent to the client.

### External assets

Theme-specific binary assets must not be committed to this repository. Mount or deploy them outside the repo and point `THEME_ASSETS_ROOT` to that directory:

```env
THEME_ASSETS_ROOT=/var/lib/slender/theme-assets
```

Example `cip-slender` asset pack layout:

```text
/var/lib/slender/theme-assets/cip-slender/
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
  "name": "cip-slender",
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

Only `png`, `jpg`, `jpeg`, `gif`, `webp`, and `ico` files are served by `/theme-assets/[theme]/[...path]`. Asset paths are validated before public URLs are generated, and the endpoint rejects traversal, dotfiles, backslashes, null bytes, directories, blocked extensions, and symlinks that escape the theme root.

`cip-slender` works without an asset pack and falls back to neutral placeholders. Missing or invalid asset pack warnings are only shown to admins.

The deployment operator is responsible for confirming asset rights and authorization. Keeping CipSoft-like assets outside the MIT repository keeps the code repository clean, but it does not remove legal risk from deploying or distributing those assets.

For local visual review, a `cip-slender` pack can contain official/Cip-like pieces such as the page background, logo, menu icons and labels, blue button sprites, content frame borders, news headline strips, topbar social/status icons, right-side theme boxes, trailer/screenshot previews, and shop/poll panels. These files must remain external to the repository. Before production distribution, either obtain authorization for those assets or replace/modify them with assets the deployment operator is allowed to use.

### Acceptance checklist

- `SLENDER_THEME=legbone` keeps the existing visual and flows.
- `SLENDER_THEME=cip-slender` works without external assets.
- `SLENDER_THEME=cip-slender` works with a mounted external asset pack.
- Asset endpoint attacks using `..`, encoded traversal, backslashes, null bytes, dotfiles, symlink escape, directories, and blocked extensions fail.
- No MyAAC PHP/Twig/CSS/JS is copied into this repository.
- No CipSoft-like binary assets are committed to this repository.

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
