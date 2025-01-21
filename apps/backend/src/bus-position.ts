/* eslint-disable @typescript-eslint/naming-convention */
enum LicensePlates {
  "AAA-1111" = "AAA-1111",
}
/* eslint-enable @typescript-eslint/naming-convention */

type Buses = {
  [plates in keyof typeof LicensePlates]?: {
    currentPosition: number[];
  };
};

const buses: Buses = {};

export { buses, LicensePlates };
