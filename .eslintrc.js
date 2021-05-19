module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: ['eslint:recommended', 'plugin:vue/essential'],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {}
}
