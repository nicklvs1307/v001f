require('dotenv').config();
const axios = require('axios');

async function testIfoodConnection() {
    const clientId = process.env.IFOOD_CLIENT_ID_GLOBAL || '521a9099-254a-467e-b7cd-8a5cade41113'; // Fallback para o ID do seu teste se a env falhar
    
    console.log('--- Teste de Conexão iFood (Distributed Auth) ---');
    console.log(`Usando Client ID: ${clientId}`);
    console.log('Tentando obter User Code...');

    try {
        // Exatamente a mesma configuração que apliquei no seu Backend
        const response = await axios.post(
            'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/userCode',
            new URLSearchParams({ clientId: clientId }).toString(),
            {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    'User-Agent': 'curl/7.68.0', // O segredo para passar pelo firewall
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('\n✅ SUCESSO! O iFood respondeu:');
        console.log('---------------------------------------------------');
        console.log('User Code:', response.data.userCode);
        console.log('Link para o cliente:', response.data.verificationUrlComplete);
        console.log('Verifier (seria salvo no banco):', response.data.authorizationCodeVerifier.substring(0, 20) + '...');
        console.log('---------------------------------------------------');
        console.log('Se você viu isso, o botão "Conectar" no Voltaki vai funcionar agora.');

    } catch (error) {
        console.error('\n❌ ERRO:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testIfoodConnection();
