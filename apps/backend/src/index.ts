import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono()
  .get("/", (context) => {
    return context.text("Hello Hono!");
  })
  .get("/teste", (c) => {
    return c.text("Hello");
  });

const port = 3000;
console.log(`Server is running on http://localhost:${port.toString()}`);

serve({
  fetch: app.fetch,
  port,
});

type App = typeof app;

export type { App };
