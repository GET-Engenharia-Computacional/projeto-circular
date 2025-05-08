import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { login } from "./login.js";
import { busLocation, busLocationWebSocket } from "./bus-location.js";

const app = new Hono()
  .route("/", busLocation) // For some reason the endpoint has to be defined on the route definition instead of the route grouping, otherwise the websocat will run in the wrong endpoint
  .route("/login", login);

const port = 3000;
console.log(`Server is running on http://localhost:${port.toString()}`);

const server = serve({
  fetch: app.fetch,
  port,
});
busLocationWebSocket(server);

type App = typeof app;

export type { App };
