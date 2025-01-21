import { config as baseConfig } from "./base.ts";
import tseslint from "typescript-eslint";

const backendConfig = tseslint.config(...baseConfig, {
  rules: {
    "import/no-default-export": "warn",
  },
});

export { backendConfig };
