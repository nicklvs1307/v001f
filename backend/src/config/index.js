const fs = require("fs");

const readSecret = (secretName) => {
  // Tenta ler da variável de ambiente diretamente
  if (process.env[secretName]) {
    return process.env[secretName];
  }

  // Se não, tenta ler do arquivo de segredo
  const secretPath = process.env[`${secretName}_FILE`];
  if (secretPath) {
    try {
      const secret = fs.readFileSync(secretPath, "utf8");
      return secret.trim();
    } catch (error) {
      console.error(
        `Erro ao ler o arquivo de segredo ${secretName}_FILE:`,
        error,
      );
      throw new Error(`Erro ao carregar o segredo ${secretName} do arquivo.`);
    }
  }

  // Se nenhum dos dois estiver configurado, lança um erro
  throw new Error(
    `Segredo obrigatório não configurado: ${secretName}. Defina ${secretName} ou ${secretName}_FILE.`,
  );
};

const config = {
  db: {
    host: process.env.DB_HOST, // Acessar diretamente a variável de ambiente
    user: process.env.DB_USER, // Acessar diretamente a variável de ambiente
    password: readSecret("DB_PASSWORD"), // Usar readSecret para o segredo do arquivo
    database: process.env.DB_DATABASE, // Acessar diretamente a variável de ambiente
    port: process.env.DB_PORT || 5432, // Acessar diretamente a variável de ambiente com fallback
  },
  jwtSecret: readSecret("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  port: process.env.PORT || 3001,
  googleAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },
  webPush: {
    contactEmail: process.env.VAPID_CONTACT_EMAIL,
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
  },
};

console.log("JWT Secret loaded:", config.jwtSecret ? "********" : "NOT SET");
console.log("JWT Secret length:", config.jwtSecret ? config.jwtSecret.length : 0);

module.exports = config;
