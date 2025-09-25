require("dotenv").config();

const fs = require('fs');

// Função auxiliar para ler secrets do Docker
const readSecret = (secretName) => {
  const secretPath = process.env[`${secretName}_FILE`];
  if (secretPath) {
    try {
      return fs.readFileSync(secretPath, 'utf8').trim();
    } catch (err) {
      console.error(`Error reading secret ${secretName}:`, err);
      return null;
    }
  }
  return process.env[secretName];
};

module.exports = {
  // ... (outras configurações podem estar aqui)
  database: {
    host: process.env.DB_HOST,
    user: readSecret('DB_USER') || process.env.DB_USER,
    password: readSecret('DB_PASSWORD') || process.env.DB_PASSWORD,
    database: readSecret('DB_DATABASE') || process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  },
  jwtSecret: readSecret('JWT_SECRET') || process.env.JWT_SECRET,
  port: process.env.PORT || 3001,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },
};

