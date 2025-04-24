/* eslint-disable @typescript-eslint/naming-convention */
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";

enum BusStatus {
  NotCirculating = "NotCirculating",
  Circulating = "Circulating",
  Disconnected = "Disconnected",
}

interface BusProperties {
  status: BusStatus;
  position: number[];
}

/* eslint-disable @typescript-eslint/naming-convention */
const buses: Record<string, BusProperties> = {
  "AAA-1111": {
    status: BusStatus.NotCirculating,
    position: [],
  },
};

const licensePlateRegex = /[A-Z]{3}-\d(\d|[A-Z])\d{2}/g;
/* eslint-enable @typescript-eslint/naming-convention */

const app = new Hono();
// eslint-disable-next-line @typescript-eslint/unbound-method
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.get(
  "/bus-location",
  upgradeWebSocket((context) => {
    return {
      onOpen: (event, webSocket) => {
        const busLicensePlate = context.req.query("id");

        if (
          busLicensePlate === undefined ||
          !licensePlateRegex.test(busLicensePlate)
        ) {
          console.warn("Invalid license plate: ", busLicensePlate);
          webSocket.close();
          return;
        }

        buses[busLicensePlate].status = BusStatus.Circulating;
      },
      onMessage: (event, webSocket) => {
        const busLicensePlate = context.req.query("id");

        if (
          busLicensePlate === undefined ||
          !licensePlateRegex.test(busLicensePlate)
        ) {
          console.warn("Invalid license plate: ", busLicensePlate);
          webSocket.close();
          return;
        }

        buses[busLicensePlate].position = [0, 0];
      },
      onError: (event, webSocket) => {
        const busLicensePlate = context.req.query("id");

        if (
          busLicensePlate === undefined ||
          !licensePlateRegex.test(busLicensePlate)
        ) {
          console.warn("Invalid license plate: ", busLicensePlate);
          webSocket.close();
          return;
        }

        buses[busLicensePlate].status = BusStatus.Disconnected;
      },
      onClose: (event, webSocket) => {
        const busLicensePlate = context.req.query("id");

        if (
          busLicensePlate === undefined ||
          !licensePlateRegex.test(busLicensePlate)
        ) {
          console.warn("Invalid license plate: ", busLicensePlate);
          webSocket.close();
          return;
        }

        buses[busLicensePlate].status = BusStatus.NotCirculating;
      },
    };
  }),
);

export { app as busLocation, injectWebSocket as busLocationWebSocket, buses };
