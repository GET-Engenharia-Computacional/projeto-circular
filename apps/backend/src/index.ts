import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { login } from "./login.js";
import { busLocation, busLocationWebSocket } from "./bus-location.js";

const app = new Hono()
  .route("/login", login)
  .route("/bus-location", busLocation);

const port = 3000;
console.log(`Server is running on http://localhost:${port.toString()}`);

const server = serve({
  fetch: app.fetch,
  port,
});
busLocationWebSocket(server);

type App = typeof app;

export type { App };
