const { Sequelize } = require("sequelize");
const { config } = require("./config"); // Importa a configuração consolidada

// Validação para garantir que a configuração do banco de dados foi carregada
if (!config.db || !config.db.database) {
  console.error("Erro Crítico: A configuração do banco de dados não foi carregada corretamente.");
  console.error("Verifique seu arquivo .env e as configurações em src/config/index.js");
  process.exit(1);
}

const sequelize = new Sequelize(
  config.db.database,
  config.db.user, // Corrigido de 'username' para 'user'
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres', // Definido explicitamente
    logging: false, // Desabilitar logging por padrão para não poluir o console
  }
);

// Testar a conexão
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso (Sequelize).");
  } catch (error) {
    console.error("Não foi possível conectar ao banco de dados (Sequelize):", error);
    process.exit(1); // Sair do processo se a conexão falhar
  }
}

module.exports = { sequelize, connectDB };