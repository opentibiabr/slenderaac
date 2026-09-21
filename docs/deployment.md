# Deploy SlenderAAC

This guide covers a Node.js service behind Nginx on a Linux server. For local
testing, use [Getting started](getting-started.md). `npm run dev` is intended for
development, not a public production service.

## Prepare the application

Install [Node.js LTS](https://nodejs.org/en/about/previous-releases),
[Bun](https://bun.sh/docs/installation) and [Nginx](https://nginx.org/en/).
Follow the [initial setup](getting-started.md#first-installation) for the checkout,
dependencies, configuration, database migrations and external assets. Use the
game database you intend to serve and back it up before migrations.

Run the commands below from the application root. Configure `.env` for the public
site before building, including `PUBLIC_BASE_URL`, public links, administrator
email, SMTP and any enabled payment integration. Public/static environment values
can be compiled into the application, so changing them requires another build.
Keep private values outside version control.

The runtime must be able to read `SERVER_CONFIG_FILE` when configured, plus the
external asset directories and optional server catalog. If the service uses
different paths or its own environment variables, configure those runtime paths
there too; a checkout's `.env` does not override service-supplied variables.
See [database configuration](database.md) and [asset installation](classic-assets.md).

## Build and start

```sh
npm run generate
npm run build
```

This creates the Node application in `build`, including server code and browser
assets. External image packs remain outside the checkout. Build again after an
application update or a change to compiled configuration.

Start the generated application, replacing the example origin with your public URL:

```sh
NODE_ENV=production HOST=127.0.0.1 PORT=3000 ORIGIN=https://your-server.example node -r dotenv/config build
```

The `dotenv/config` preload loads `.env` for the Node process. The database resolver
also applies at runtime. `ORIGIN` must match the public origin used by browsers,
including HTTPS; `PUBLIC_BASE_URL` should point to the same site. See the
[SvelteKit Node adapter documentation](https://svelte.dev/docs/kit/adapter-node)
for runtime settings and proxy behavior.

Use a service manager for persistent operation, with the application folder as
its working directory and read access to the configured files. Run as a dedicated
service user. Capture stdout/stderr through that manager; the application does
not create log files automatically.

## Reverse proxy

Nginx forwards requests to the application on port 3000. A basic HTTP example is:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-server.example;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Add TLS using your hosting provider's HTTPS setup and keep the application's
origin consistent with that public URL. The example above alone does not configure
HTTPS. Keep the Node listener private behind the proxy. Another reverse proxy
can serve the same role.

After deployment, check the public pages, login/forms and the
[asset URLs](classic-assets.md#store-and-animation-checks). Use
[diagnostics](diagnostics.md) if requests fail or live data is unavailable.

## Update an existing service

Stop the service, back up its database and configuration, and follow the
[update sequence](getting-started.md#updating). Do not repeat the initial migration
baseline. Install any asset updates before building, rebuild the application,
then restart the managed Node service instead of running the development server.
