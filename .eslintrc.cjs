module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true }
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "prettier"
  ],
  rules: {
    "no-console": ["warn", { allow: ["info", "error", "warn"] }],
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "import/no-unresolved": "off",
    "import/no-named-as-default-member": "off",
    "import/no-named-as-default": "off",
    "import/order": [
      "warn",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ]
  },
  settings: {
    "import/resolver": {
      typescript: {}
    }
  },
  overrides: [
    {
      files: ["**/*.js"],
      env: { node: true },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "no-console": "off"
      }
    },
    {
      files: ["packages/db/**/*.ts", "services/**/*.ts"],
      env: { node: true },
      rules: {
        "no-console": "off"
      }
    },
    {
      files: ["apps/**/*.ts", "apps/**/*.tsx", "packages/ui/**/*.ts", "packages/ui/**/*.tsx"],
      env: { browser: true }
    }
  ]
};

