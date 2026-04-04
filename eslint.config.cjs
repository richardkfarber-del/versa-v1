const security = require("eslint-plugin-security");

module.exports = [
  {
    files: ["**/*.js"],
    plugins: {
      security: security
    },
    rules: {
      ...security.configs.recommended.rules
    }
  }
];
