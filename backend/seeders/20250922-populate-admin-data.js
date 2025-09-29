'use strict';
const { v4: uuidv4 } = require('uuid');

// Função auxiliar para criar uma resposta
const createResponse = (pesquisaId, pergunta, atendenteId, client, tenantId, value) => {
  const response = {
    id: uuidv4(),
    pesquisaId,
    perguntaId: pergunta.id,
    atendenteId,
    respondentSessionId: client.respondentSessionId,
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  if (pergunta.type.startsWith('rating')) {
    response.ratingValue = value;
  } else if (pergunta.type === 'free_text') {
    response.textValue = value;
  } else {
    response.selectedOption = value;
  }
  return response;
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Obter Tenant e Admin User
      const tenantResult = await queryInterface.sequelize.query(`SELECT id FROM tenants WHERE name = 'Empresa de Exemplo'`, { type: Sequelize.QueryTypes.SELECT, transaction });
      if (!tenantResult.length) {
        console.log('Tenant "Empresa de Exemplo" não encontrado. Pulando seeder.');
        await transaction.commit();
        return;
      }
      const tenantId = tenantResult[0].id;

      const adminUserResult = await queryInterface.sequelize.query(`SELECT id FROM usuarios WHERE email = 'admin@empresaexemplo.com'`, { type: Sequelize.QueryTypes.SELECT, transaction });
      const adminUserId = adminUserResult.length ? adminUserResult[0].id : null;

      // --- Dados de Exemplo ---
      const atendentesData = [
        { name: 'Atendente João', code: 'ATD001' },
        { name: 'Atendente Maria', code: 'ATD002' },
        { name: 'Atendente Carlos', code: 'ATD003' },
        { name: 'Atendente Ana', code: 'ATD004' },
      ];
      const criteriosData = [
        { name: 'NPS Geral', type: 'NPS' },
        { name: 'Qualidade da Comida', type: 'CSAT' },
        { name: 'Qualidade do Atendimento', type: 'CSAT' },
        { name: 'Limpeza e Ambiente', type: 'CSAT' },
      ];
      const recompensasData = [
        { name: 'Café Grátis', pointsRequired: 100 },
        { name: 'Desconto de 10%', pointsRequired: 200 },
        { name: 'Sobremesa Grátis', pointsRequired: 150 },
      ];
      const clientsData = [
        { name: 'Cliente A', email: 'clienteA@email.com', phone: '11999999901' },
        { name: 'Cliente B', email: 'clienteB@email.com', phone: '11999999902' },
        { name: 'Cliente C', email: 'clienteC@email.com', phone: '11999999903' },
        { name: 'Cliente D', email: 'clienteD@email.com', phone: '11999999904' },
        { name: 'Cliente E', email: 'clienteE@email.com', phone: '11999999905' },
      ];

      // --- Inserção Idempotente ---
      const upsert = async (tableName, data, uniqueField) => {
        const existingRecords = await queryInterface.sequelize.query(`SELECT "${uniqueField}" FROM "${tableName}" WHERE "${uniqueField}" IN (:values)`, { replacements: { values: data.map(d => d[uniqueField]) }, type: Sequelize.QueryTypes.SELECT, transaction });
        const existingValues = existingRecords.map(r => r[uniqueField]);
        const newData = data.filter(d => !existingValues.includes(d[uniqueField])).map(d => ({ ...d, id: uuidv4(), tenantId, createdAt: new Date(), updatedAt: new Date() }));
        if (newData.length > 0) {
          await queryInterface.bulkInsert(tableName, newData, { transaction });
        }
        const allRecords = await queryInterface.sequelize.query(`SELECT id, "${uniqueField}" FROM "${tableName}" WHERE "tenantId" = :tenantId`, { replacements: { tenantId }, type: Sequelize.QueryTypes.SELECT, transaction });
        return allRecords;
      };

      const atendentes = await upsert('atendentes', atendentesData, 'code');
      const criterios = await upsert('criterios', criteriosData, 'name');
      await upsert('recompensas', recompensasData, 'name');
      const clients = await upsert('clients', clientsData, 'email');
      clients.forEach(c => c.respondentSessionId = uuidv4()); // Add session ID for responses

      // Obter as recompensas criadas para associar aos cupons
      const allRecompensas = await queryInterface.sequelize.query(`SELECT id, name FROM recompensas WHERE "tenantId" = :tenantId`, { replacements: { tenantId }, type: Sequelize.QueryTypes.SELECT, transaction });

      // 1.5. Criar Cupons de Exemplo
      const existingCouponsCount = (await queryInterface.sequelize.query(`SELECT COUNT(id) as count FROM cupons WHERE "tenantId" = :tenantId`, { replacements: { tenantId }, type: Sequelize.QueryTypes.SELECT, transaction }))[0].count;
      const cuponsToInsert = [];
      if (clients.length > 0 && allRecompensas.length > 0 && existingCouponsCount < 1) {
        for (let i = 0; i < clients.length * 2; i++) { // Gerar 2 cupons por cliente, por exemplo
          const client = clients[i % clients.length];
          const recompensa = allRecompensas[i % allRecompensas.length];
          const status = Math.random() > 0.5 ? 'used' : 'pending';
          const dataGeracao = new Date();
          const dataValidade = new Date(dataGeracao);
          dataValidade.setDate(dataValidade.getDate() + 30); // Válido por 30 dias

          cuponsToInsert.push({
            id: uuidv4(),
            tenantId,
            recompensaId: recompensa.id,
            codigo: uuidv4().substring(0, 8).toUpperCase(), // Código curto e único
            clienteId: client.id,
            dataGeracao,
            dataValidade,
            status,
            dataUtilizacao: status === 'used' ? new Date() : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      if (cuponsToInsert.length > 0) {
        await queryInterface.bulkInsert('cupons', cuponsToInsert, { transaction });
      }

      // 2. Criar Pesquisa e Perguntas
      const pesquisaTitle = 'Pesquisa de Satisfação Geral';
      let pesquisa = (await queryInterface.sequelize.query(`SELECT id FROM pesquisas WHERE title = :title AND "tenantId" = :tenantId`, { replacements: { title: pesquisaTitle, tenantId }, type: Sequelize.QueryTypes.SELECT, transaction }))[0];
      if (!pesquisa) {
        const pesquisaId = uuidv4();
        await queryInterface.bulkInsert('pesquisas', [{
          id: pesquisaId,
          tenantId,
          creatorId: adminUserId,
          title: pesquisaTitle,
          description: 'Avalie sua experiência geral com nossos serviços.',
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          status: 'active',
          askForAttendant: true,
          isOpen: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }], { transaction });
        pesquisa = { id: pesquisaId };
      }

      const perguntasData = [
        { id: uuidv4(), type: 'rating_0_10', text: 'Em uma escala de 0 a 10, o quanto você recomendaria nosso restaurante?', criterioName: 'NPS Geral', required: true },
        { id: uuidv4(), type: 'rating_1_5', text: 'Como você avalia a qualidade da nossa comida?', criterioName: 'Qualidade da Comida', required: true },
        { id: uuidv4(), type: 'rating_1_5', text: 'Como você avalia a qualidade do nosso atendimento?', criterioName: 'Qualidade do Atendimento', required: true },
        { id: uuidv4(), type: 'rating_1_5', text: 'Como você avalia a limpeza e o ambiente?', criterioName: 'Limpeza e Ambiente', required: true },
        { id: uuidv4(), type: 'free_text', text: 'Qual o principal motivo da sua nota? (opcional)', required: false },
      ];

      const existingPerguntas = await queryInterface.sequelize.query(`SELECT text FROM perguntas WHERE "pesquisaId" = :pesquisaId`, { replacements: { pesquisaId: pesquisa.id }, type: Sequelize.QueryTypes.SELECT, transaction });
      const existingPerguntasText = existingPerguntas.map(p => p.text);
      const newPerguntas = perguntasData.filter(p => !existingPerguntasText.includes(p.text)).map((p, index) => {
        const { criterioName, ...restOfP } = p;
        return {
          ...restOfP,
          pesquisaId: pesquisa.id,
          criterioId: (criterios.find(c => c.name === criterioName) || {}).id || null,
          order: index + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      if (newPerguntas.length > 0) {
        await queryInterface.bulkInsert('perguntas', newPerguntas, { transaction });
      }
      const allPerguntas = await queryInterface.sequelize.query(`SELECT id, text, type FROM perguntas WHERE "pesquisaId" = :pesquisaId`, { replacements: { pesquisaId: pesquisa.id }, type: Sequelize.QueryTypes.SELECT, transaction });

      // 3. Gerar um volume maior de respostas
      const existingResponsesCount = (await queryInterface.sequelize.query(`SELECT COUNT(id) as count FROM respostas WHERE "pesquisaId" = :pesquisaId`, { replacements: { pesquisaId: pesquisa.id }, type: Sequelize.QueryTypes.SELECT, transaction }))[0].count;
      if (existingResponsesCount < 20) { // Only seed responses if there are few
        const responses = [];
        const textFeedbacks = ["Tudo ótimo!", "A comida estava fria.", "Atendimento excelente!", "Demorou muito.", "Ambiente agradável.", "Preço justo.", "Poderia ser melhor.", "Adorei a sobremesa!"];
        
        for (let i = 0; i < 25; i++) {
          const client = clients[i % clients.length];
          const atendente = atendentes[i % atendentes.length];
          
          // NPS
          responses.push(createResponse(pesquisa.id, allPerguntas[0], atendente.id, client, tenantId, Math.floor(Math.random() * 6) + 5)); // Notas 5-10
          // Comida
          responses.push(createResponse(pesquisa.id, allPerguntas[1], atendente.id, client, tenantId, Math.floor(Math.random() * 3) + 3)); // Notas 3-5
          // Atendimento
          responses.push(createResponse(pesquisa.id, allPerguntas[2], atendente.id, client, tenantId, Math.floor(Math.random() * 3) + 3)); // Notas 3-5
          // Ambiente
          responses.push(createResponse(pesquisa.id, allPerguntas[3], atendente.id, client, tenantId, Math.floor(Math.random() * 2) + 4)); // Notas 4-5
          // Feedback
          if (i % 2 === 0) {
            responses.push(createResponse(pesquisa.id, allPerguntas[4], atendente.id, client, tenantId, textFeedbacks[i % textFeedbacks.length]));
          }
        }
        await queryInterface.bulkInsert('respostas', responses, { transaction });
      }

      await transaction.commit();
      console.log('Seeder de dados de exemplo aprimorado executado com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao executar o seeder de dados de exemplo aprimorado:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tenantResult = await queryInterface.sequelize.query(`SELECT id FROM tenants WHERE name = 'Empresa de Exemplo'`, { type: Sequelize.QueryTypes.SELECT, transaction });
      if (!tenantResult.length) {
        await transaction.commit();
        return;
      }
      const tenantId = tenantResult[0].id;

      // Remover na ordem inversa de dependência
      await queryInterface.bulkDelete('cupons', { tenantId }, { transaction });
      await queryInterface.bulkDelete('respostas', { tenantId }, { transaction });
      await queryInterface.bulkDelete('perguntas', { pesquisaId: (await queryInterface.sequelize.query(`SELECT id FROM pesquisas WHERE "tenantId" = :tenantId`, { replacements: { tenantId }, type: Sequelize.QueryTypes.SELECT, transaction })).map(p => p.id) }, { transaction });
      await queryInterface.bulkDelete('pesquisas', { tenantId }, { transaction });
      await queryInterface.bulkDelete('clients', { tenantId }, { transaction });
      await queryInterface.bulkDelete('recompensas', { tenantId }, { transaction });
      await queryInterface.bulkDelete('criterios', { tenantId }, { transaction });
      await queryInterface.bulkDelete('atendentes', { tenantId }, { transaction });

      await transaction.commit();
      console.log('Seeder de dados de exemplo aprimorado revertido com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao reverter o seeder de dados de exemplo aprimorado:', error);
      throw error;
    }
  }
};
