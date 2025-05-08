import { Hono } from "hono";

const app = new Hono();

const route = app.get("/", (context) => {
  return context.text("oi");
});

export { route as login };
