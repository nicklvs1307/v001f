const config = require("./index"); // Importar o objeto de configuração centralizado

module.exports = {
  development: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
  },
  test: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
  },
  production: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    dialectOptions: {
      ssl: false,
    },
  },
};
