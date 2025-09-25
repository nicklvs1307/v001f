#!/bin/sh
# O comando 'set -e' garante que o script irá parar se algum comando falhar.
set -e

echo "Aguardando o banco de dados ficar pronto..."
# Adicionar um pequeno delay pode ajudar a garantir que o DB esteja pronto para aceitar conexões.
# Para uma solução mais robusta, um script como 'wait-for-it.sh' seria ideal.
sleep 5

echo "Rodando as migrações do banco de dados..."
# Executa o comando de migração do Sequelize
npx sequelize-cli db:migrate

echo "Migrações concluídas. Iniciando a aplicação..."
# O comando 'exec "$@"' executa o comando que foi passado como argumento para o entrypoint.
# No nosso caso, será o CMD do Dockerfile: ["node", "src/server.js"]
exec "$@"
