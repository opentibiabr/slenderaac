# Slender AAC

This project is a website for the [Canary](https://github.com/opentibiabr/canary) project. The main goal is to use modern technology to have something that is easy to maintain and extend. It is also meant to be efficient, secure and easy to deploy.

## Getting started

New to SlenderAAC? Follow the **[beginner setup guide](docs/getting-started.md)**
for the first installation, configuration, database setup, images, running and
stopping the website, and updates. It includes Windows PowerShell commands and
explains what each step does.

Already installed? Go straight to the [common commands](docs/getting-started.md#common-commands)
or [troubleshooting](docs/getting-started.md#troubleshooting).

## Documentation

| Guide                                                      | What it covers                                                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [Database configuration](docs/database.md)                 | Use the running game server's configuration, understand fallback behavior and check the selected database.        |
| [Install website assets](docs/classic-assets.md)           | One-command installation and updates for Classic, outfits, items and store images from the fixed release channel. |
| [Choose a layout](docs/themes.md)                          | Switch between Classic and Legbone, set a default or enforce one layout.                                          |
| [Theme extension roadmap](docs/theme-extension-roadmap.md) | Implemented registry and renderer contract, third-layout recipe and remaining validation gate.                    |
| [Server library](docs/server-library.md)                   | Import spells, creatures, achievements and house definitions from the game server.                                |
| [Game client connection](docs/client.md)                   | Configure the website login endpoint and store-image URL.                                                         |
| [Deployment](docs/deployment.md)                           | Build and run the Node application behind a reverse proxy.                                                        |
| [Logs and diagnostics](docs/diagnostics.md)                | Capture startup/request timings and investigate unavailable boosted data.                                         |

## Website roadmap

FAQ, Parents' Guide and Legal Documents are implemented in Classic and Legbone.
The next priority is website-only work, followed by modules that need game rules
or authoritative server integration.

- [Page roadmap — status, priorities and expandable details](docs/page-roadmap.md)
- [Support pages — setup and content editing](docs/support.md)
- [Fankit — publish the operator artwork package](docs/fankit.md)
- [Soundtrack — publish and stream operator audio](docs/soundtrack.md)
- [Maps — publish the operator world overview](docs/maps.md)
- [Feature discussion](https://github.com/luan/slenderaac/issues/24)

<details>
<summary><h2>Earlier interface screenshots</h2></summary>

These captures predate the Classic layout and show an earlier version of the site.

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

Start with the [website and theme contracts](docs/theme-contracts.md) when adding
or changing pages. They link the shared layout, native data, navigation, identity,
asset delivery and verification rules. Follow the [UI state rules](docs/ui-states.md)
for confirmed zero, empty results, offline services, unavailable data, errors and
stale values in both layouts.

## License

MIT
