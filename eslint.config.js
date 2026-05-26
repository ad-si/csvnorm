import tsPlugin from "@typescript-eslint/eslint-plugin"

export default [
  ...tsPlugin.configs["flat/recommended"],
  {
    files: ["{source,tests,types}/**/*.ts"],
    rules: {
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "double"],
      "semi": ["error", "never"],
    },
  },
]
