module.exports = {
    settings: {
      react: {
        version: "detect", // React version. "detect" automatically picks the version you have installed.
      },
    },
    env: {
        browser: true,
        es6: true
    },
    extends: [
        "react-app",
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
    ],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            "jsx": true
        },
        ecmaVersion: 2018,
        sourceType: "module"
    },
    plugins: [
        "react",
        "@typescript-eslint"
    ],
    rules: {
      // enable additional rules
      // "indent": ["error", 4],
      "no-unused-vars": ["error"],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      // override default options for rules from base configurations
      "comma-dangle": ["error", "never"],
      "no-cond-assign": ["error", "always"],
      // disable rules from base configurations
      "no-console": "off",

    }
};
