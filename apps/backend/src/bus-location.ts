import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { z } from "zod";

enum BusStatus {
  notCirculating = "NotCirculating",
  circulating = "Circulating",
  disconnected = "Disconnected",
}

interface BusProperties {
  status: BusStatus;
  position: number[];
  timestamp: Date;
  speed: number;
  headingTowards: number;
}

/* eslint-disable @typescript-eslint/naming-convention */
const buses: Record<string, BusProperties> = {
  "AAA-1111": {
    status: BusStatus.notCirculating,
    position: [],
    timestamp: new Date(0),
    speed: 0,
    headingTowards: 0,
  },
};
/* eslint-enable @typescript-eslint/naming-convention */

const licensePlateRegex = /[A-Z]{3}-\d(\d|[A-Z])\d{2}/;

const app = new Hono();
// eslint-disable-next-line @typescript-eslint/unbound-method
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app
  .get(
    "/bus-location",
    upgradeWebSocket((context) => {
      return {
        onOpen: (event, webSocket) => {
          const busLicensePlate = context.req.query("bus");

          if (
            busLicensePlate === undefined ||
            !licensePlateRegex.test(busLicensePlate) ||
            !(busLicensePlate in buses)
          ) {
            console.warn("Invalid license plate: ", busLicensePlate);
            webSocket.close();
            return;
          }

          buses[busLicensePlate].status = BusStatus.circulating;
        },
        onMessage: (event, webSocket) => {
          const busLicensePlate = context.req.query("bus");

          if (
            busLicensePlate === undefined ||
            !licensePlateRegex.test(busLicensePlate) ||
            !(busLicensePlate in buses)
          ) {
            console.warn("Invalid license plate:", busLicensePlate);
            webSocket.close();
            return;
          }

          const messageSchema = z
            .object({
              timestamp: z.coerce.date(),
              coords: z.object({
                altitude: z.number().min(0).max(0),
                altitudeAccuracy: z.number().min(-1).max(-1),
                latitude: z.number(),
                longitude: z.number(),
                accuracy: z.number(),
                heading: z.number(),
                speed: z.number(),
              }),
            })
            .array()
            .nonempty();

          const message = messageSchema.safeParse(
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            JSON.parse(event.data.toString()),
          );

          if (!message.success) {
            console.warn("Message schema parsing error:", message.error);
            webSocket.close();
            return;
          }

          buses[busLicensePlate].timestamp = message.data[0].timestamp;
          buses[busLicensePlate].position = [
            message.data[0].coords.latitude,
            message.data[0].coords.longitude,
          ];
          buses[busLicensePlate].speed = message.data[0].coords.speed;
          buses[busLicensePlate].headingTowards =
            message.data[0].coords.heading;

          console.log(buses[busLicensePlate]);
        },
        onError: (event, webSocket) => {
          const busLicensePlate = context.req.query("bus");

          if (
            busLicensePlate === undefined ||
            !licensePlateRegex.test(busLicensePlate) ||
            !(busLicensePlate in buses)
          ) {
            console.warn("Invalid license plate: ", busLicensePlate);
            webSocket.close();
            return;
          }

          buses[busLicensePlate].status = BusStatus.disconnected;

          console.warn("WebSocket error:", event);
        },
        onClose: (event, webSocket) => {
          const busLicensePlate = context.req.query("bus");

          if (
            busLicensePlate === undefined ||
            !licensePlateRegex.test(busLicensePlate) ||
            !(busLicensePlate in buses)
          ) {
            console.warn("Invalid license plate: ", busLicensePlate);
            webSocket.close();
            return;
          }

          buses[busLicensePlate].status = BusStatus.notCirculating;
        },
      };
    }),
  )
  .get("/bus-location", (context) => {
    return context.text(JSON.stringify(buses));
  });

export { app as busLocation, injectWebSocket as busLocationWebSocket, buses };
