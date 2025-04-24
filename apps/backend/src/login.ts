import { Hono } from "hono";

const app = new Hono();

const route = app.get("/login", (context) => {
  return context.text("oi");
});

export { route as login };
