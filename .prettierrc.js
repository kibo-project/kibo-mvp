module.exports = {
  singleQuote: false,
  semi: true,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 120,
  arrowParens: "avoid",
  importOrder: ["^react$", "^next/(.*)$", "<THIRD_PARTY_MODULES>", "^@heroicons/(.*)$", "^~~/(.*)$"],
  importOrderSortSpecifiers: true,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};
