import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

const config = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  {
    settings: {
      "import/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: ["packages/*/tsconfig.json", "apps/*/tsconfig.json"],
        }),
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    ignores: ["dist/**"],

    plugins: {
      turbo: turboPlugin,
    },
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],

    rules: {
      "no-var": "error",
      "turbo/no-undeclared-env-vars": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/consistent-type-exports": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/naming-convention": "warn",
      "@typescript-eslint/prefer-ts-expect-error": "warn",
      "import/no-mutable-exports": "error",
      "import/no-commonjs": "error",
      "import/first": "warn",
      "import/exports-last": "warn",
    },
  },
);

export { config };
