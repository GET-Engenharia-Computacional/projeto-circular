import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { buses, busLocation } from "./bus-location.js";

const app = new Hono();

// eslint-disable-next-line @typescript-eslint/unbound-method
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const routes = app
  .get("/", (context) => {
    return context.text(JSON.stringify(buses));
  })
  .get("/bus-location", upgradeWebSocket(busLocation));

const port = 3000;
console.log(`Server is running on http://localhost:${port.toString()}`);

const server = serve({
  fetch: routes.fetch,
  port,
});

injectWebSocket(server);

type App = typeof routes;
export type { App };
