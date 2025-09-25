const fs = require('fs');

const readSecret = (secretName) => {
  // Tenta ler da variável de ambiente diretamente
  if (process.env[secretName]) {
    return process.env[secretName];
  }

  // Se não, tenta ler do arquivo de segredo
  const secretPath = process.env[`${secretName}_FILE`];
  if (secretPath) {
    try {
      const secret = fs.readFileSync(secretPath, 'utf8');
      return secret.trim();
    } catch (error) {
      console.error(`Erro ao ler o arquivo de segredo ${secretName}_FILE:`, error);
      throw new Error(`Erro ao carregar o segredo ${secretName} do arquivo.`);
    }
  }

  // Se nenhum dos dois estiver configurado, retorna null ou lança um erro, dependendo da necessidade
  // Por enquanto, vamos retornar null e deixar a validação para onde for usado.
  return null;
};

const config = {
  db: {
    host: process.env.DB_HOST,
    user: readSecret('DB_USER'),
    password: readSecret('DB_PASSWORD'),
    database: readSecret('DB_DATABASE'),
    port: process.env.DB_PORT,
  },
  jwtSecret: readSecret('JWT_SECRET'),
  port: process.env.PORT || 3001,
  googleAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },
};

module.exports = config;

