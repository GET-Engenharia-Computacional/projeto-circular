import { backendConfig } from "@repo/eslint-config/backend";
import tseslint from "typescript-eslint";

const config = tseslint.config(...backendConfig);

export default config;
