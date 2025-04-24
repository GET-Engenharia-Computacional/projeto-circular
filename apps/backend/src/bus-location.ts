import { type Context } from "hono";
import type { WSEvents } from "hono/ws";
import { z } from "zod";

/* eslint-disable @typescript-eslint/naming-convention */
enum LicensePlates {
  "AAA-1111" = "AAA-1111",
}

type Buses = {
  [plates in keyof typeof LicensePlates]: {
    status: BusStatus;
    currentPosition: number[];
  };
};

enum BusStatus {
  "notCirculating" = "notCirculating",
  "circulating" = "circulating",
  "disconnected" = "disconnected",
}

const buses: Buses = {
  "AAA-1111": {
    status: BusStatus.notCirculating,
    currentPosition: [],
  },
};
/* eslint-enable @typescript-eslint/naming-convention */

const busLocation = (
  content: Context,
): WSEvents<WebSocket> | Promise<WSEvents<WebSocket>> => {
  return {
    onOpen(_, websocket) {
      const query = content.req.query("bus");

      const licensePlateRegex = /[A-Z]{3}-\d(\d|[A-Z])\d{2}/g;
      if (
        query === undefined ||
        !(
          query.match(licensePlateRegex) &&
          Object.values(LicensePlates).includes(query as LicensePlates)
        )
      ) {
        websocket.close();
        return;
      }

      buses[query as LicensePlates].status = BusStatus.circulating;
    },
    onMessage(event) {
      const requestSchema = z
        .object({
          coords: z.object({
            altitude: z.number(),
            altitudeAccuracy: z.number(),
            latitude: z.number(),
            accuracy: z.number(),
            longitude: z.number(),
            heading: z.number(),
            speed: z.number(),
          }),
          timestamp: z.number(),
        })
        .array();

      let request: z.infer<typeof requestSchema>;
      try {
        const message = event.data.valueOf();
        request = requestSchema.parse(
          typeof message === "object" ? message : JSON.parse(message),
        );
      } catch (error) {
        console.error(error);
        return;
      }

      const query = content.req.query("bus");

      buses[query as LicensePlates].currentPosition = [
        request[0].coords.latitude,
        request[0].coords.longitude,
      ];
    },
    onError() {
      const query = content.req.query("bus");

      buses[query as LicensePlates].status = BusStatus.disconnected;
    },
    onClose() {
      const query = content.req.query("bus");

      buses[query as LicensePlates].status = BusStatus.notCirculating;
    },
  };
};

export { buses, LicensePlates, BusStatus, busLocation };
