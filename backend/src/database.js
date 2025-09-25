const { Sequelize } = require("sequelize");
const config = require("./config"); // Importa a configuração consolidada

// Validação para garantir que a configuração do banco de dados foi carregada
if (!config.database || !config.database.database) {
  console.error("Erro Crítico: A configuração do banco de dados não foi carregada corretamente.");
  console.error("Verifique seu arquivo .env e as configurações em src/config/index.js");
  process.exit(1);
}

const sequelize = new Sequelize(
  config.database.database,
  config.database.user, // Corrigido de 'username' para 'user'
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
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