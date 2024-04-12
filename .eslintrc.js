module.exports = {
  "ignorePatterns": [".eslintrc.js", "*.config.js"],
  "settings": {
    "react": {
      "version": "detect", // React version. "detect" automatically picks the version you have installed.
    },
  },
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "standard-with-typescript",
    "plugin:react/recommended"
  ],
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    }
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "parser": "@typescript-eslint/parser",
    "project": "./tsconfig.json",
  },
  "plugins": [
    "only-warn",
    "react"
  ],
  "rules": {
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/space-before-function-paren": ["error", "never"],
    "@typescript-eslint/no-unused-vars": "off",
    "react/react-in-jsx-scope": "off",
    "react/display-name": "off",
    "no-return-assign": "off",
    "quote-props": "off",
    "@typescript-eslint/space-infix-ops" : "warn",
    "space-infix-ops" : "warn",
    "no-trailing-spaces": "off",
    "@typescript-eslint/keyword-spacing": "warn",
    "keyword-spacing": "warn",
    "@typescript-eslint/brace-style": "warn",
    "@typescript-eslint/object-curly-spacing": "warn",
    "object-curly-spacing": "warn",
    "@typescript-eslint/indent": "warn",
    "indent": "warn",
    "no-multi-spaces": "warn",
    "padded-blocks": "warn",
    "prefer-const": "warn",
    "spaced-comment": "warn",
    "no-useless-escape": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "no-extraneous-class": "off",
    "@typescript-eslint/brace-style)" : "off",
    "brace-style" : "off",
    "@typescript-eslint/comma-spacing" : "warn",
    "comma-spacing" : "warn",
    "arrow-spacing" : "warn",
    "no-multiple-empty-lines" : "warn",
    "@typescript-eslint/key-spacing" : "warn",
    "@typescript-eslint/type-annotation-spacing" : "warn",
    "block-spacing" : "warn",
    "spaced-comment" : "off",
    "@typescript-eslint/dot-notation" : "off",
    "dot-notation" : "off",
  }
}
