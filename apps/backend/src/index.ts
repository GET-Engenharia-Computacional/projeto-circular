import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";

const app = new Hono();

// eslint-disable-next-line @typescript-eslint/unbound-method
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const routes = app
  .get("/", (context) => {
    return context.text("Hello Hono!");
  })
  .get(
    "/bus-location",
    upgradeWebSocket(() => {
      return {
        onMessage(event, websocket) {
          const message = event.data.valueOf();

          websocket.send(
            typeof message == "object" ? JSON.stringify(message) : message,
          );
        },
      };
    }),
  );

const port = 3000;
console.log(`Server is running on http://localhost:${port.toString()}`);

const server = serve({
  fetch: routes.fetch,
  port,
});

injectWebSocket(server);

type App = typeof routes;
export type { App };
