module.exports = {
  plugins: ["@html-eslint"],
  overrides: [
    {
      files: ["*.html"],
      parser: "@html-eslint/parser",
      extends: ["plugin:@html-eslint/recommended"],
      "excludedFiles": "*.test.js",
      "rules": {
        "@html-eslint/indent": ["error", 2],
        "@html-eslint/require-closing-tags": [0]
      }
    },
  ],
};
