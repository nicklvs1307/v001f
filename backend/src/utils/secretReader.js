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

module.exports = { readSecret };
