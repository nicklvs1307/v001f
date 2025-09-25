#!/bin/sh
# O comando 'set -e' garante que o script irá parar se algum comando falhar.
set -e

echo "Iniciando a aplicação..."
# O comando 'exec "$@"' executa o comando que foi passado como argumento para o entrypoint.
# No nosso caso, será o CMD do Dockerfile: ["node", "src/server.js"]
exec "$@"
