# Connect the game client

Start the website using [Getting started](getting-started.md) or your
[production deployment](deployment.md). Configure the game client's login
webservice URL to use the website's `/api/login` endpoint.

For local testing on the same PC as the client:

```text
http://127.0.0.1:5173/api/login
```

Use the port printed by the running website. For a public installation, use its
HTTPS address, for example `https://your-server.example/api/login`. A loopback
address such as `127.0.0.1` always refers to the client's own PC; it cannot point
other players at your server.

Follow the [client editor instructions](https://docs.opentibiabr.com/opentibiabr/downloads/tools/editors)
for editing a compatible client, using its SlenderAAC settings with your website
address. The website login endpoint is separate from
`SERVER_ADDRESS` and `SERVER_PORT`, which identify the game connection returned
to the client. Keep the game address reachable from the intended client machines.

For game-store images, configure `coinImagesURL` with the website's
`/images/store/` address as described in [store setup](classic-assets.md#store-and-animation-checks).
Installing those images does not create store offers or change the game server's
store rules.
