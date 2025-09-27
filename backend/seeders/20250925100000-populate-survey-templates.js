'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const templates = [
      {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        title: 'Avaliação Geral de Restaurante',
        description: 'Um modelo completo para medir a satisfação geral dos clientes em seu restaurante, cobrindo comida, serviço e ambiente.',
        type: 'NPS',
        targetAudience: 'Restaurante',
        isSystemTemplate: true,
        templateData: JSON.stringify({
          questions: [
            { text: 'Em uma escala de 0 a 10, o quão provável você é de recomendar nosso restaurante a um amigo ou familiar?', type: 'rating_0_10', required: true },
            { text: 'O que você mais gostou em sua visita?', type: 'free_text', required: false },
            { text: 'Como você avalia a qualidade da nossa comida?', type: 'rating_1_5', required: true },
            { text: 'Como você avalia a qualidade do nosso atendimento?', type: 'rating_1_5', required: true },
            { text: 'Como você avalia a limpeza e o ambiente do nosso restaurante?', type: 'rating_1_5', required: true },
            { text: 'Você tem alguma sugestão para melhorarmos?', type: 'free_text', required: false }
          ]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
        title: 'Feedback de Serviço de Delivery',
        description: 'Colete feedback específico sobre seu serviço de delivery, incluindo tempo de entrega, embalagem e qualidade da comida na chegada.',
        type: 'CSAT',
        targetAudience: 'Delivery',
        isSystemTemplate: true,
        templateData: JSON.stringify({
          questions: [
            { text: 'Como você avalia o tempo de entrega do seu pedido?', type: 'rating_1_5', required: true },
            { text: 'A sua comida chegou na temperatura correta?', type: 'multiple_choice', options: ['Sim', 'Não'], required: true },
            { text: 'Como você avalia a qualidade da embalagem?', type: 'rating_1_5', required: true },
            { text: 'O pedido veio correto e completo?', type: 'multiple_choice', options: ['Sim', 'Não'], required: true },
            { text: 'Em uma escala de 0 a 10, qual a probabilidade de você pedir conosco novamente?', type: 'rating_0_10', required: true }
          ]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef23',
        title: 'Avaliação de Pizzaria',
        description: 'Feedback específico para pizzarias, focando no sabor, qualidade dos ingredientes e tempo de forno.',
        type: 'RATINGS',
        targetAudience: 'Pizzaria',
        isSystemTemplate: true,
        templateData: JSON.stringify({
          questions: [
            { text: 'Como você avalia o sabor da sua pizza?', type: 'rating_1_5', required: true },
            { text: 'Como você avalia a qualidade dos ingredientes?', type: 'rating_1_5', required: true },
            { text: 'A pizza chegou quentinha e na consistência certa?', type: 'multiple_choice', options: ['Sim', 'Não'], required: true },
            { text: 'Qual seu sabor favorito? Gostaríamos de saber!', type: 'free_text', required: false },
            { text: 'De 0 a 10, qual a chance de você nos recomendar como a melhor pizzaria da cidade?', type: 'rating_0_10', required: true }
          ]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'd4e5f6a7-b8c9-0123-4567-890abcdef345',
        title: 'Experiência na Hamburgueria',
        description: 'Modelo para hamburguerias, avaliando o ponto da carne, a qualidade do pão e a combinação de sabores.',
        type: 'CSAT',
        targetAudience: 'Hamburgueria',
        isSystemTemplate: true,
        templateData: JSON.stringify({
          questions: [
            { text: 'O ponto da carne do seu hambúrguer estava correto?', type: 'multiple_choice', options: ['Sim', 'Não'], required: true },
            { text: 'Como você avalia a qualidade e frescor do pão?', type: 'rating_1_5', required: true },
            { text: 'O que você achou da combinação de ingredientes e molhos?', type: 'rating_1_5', required: true },
            { text: 'Nossas batatas fritas estavam crocantes e saborosas?', type: 'rating_1_5', required: true },
            { text: 'De 0 a 10, qual a chance de você voltar para provar outros burgers?', type: 'rating_0_10', required: true }
          ]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'e5f6a7b8-c9d0-1234-5678-90abcdef4567',
        title: 'Feedback de Sorveteria',
        description: 'Entenda a opinião dos clientes sobre a variedade de sabores, a qualidade e a cremosidade dos sorvetes.',
        type: 'RATINGS',
        targetAudience: 'Sorveteria',
        isSystemTemplate: true,
        templateData: JSON.stringify({
          questions: [
            { text: 'Como você avalia a variedade de sabores que oferecemos?', type: 'rating_1_5', required: true },
            { text: 'Qual o seu nível de satisfação com a qualidade e cremosidade do sorvete?', type: 'rating_1_5', required: true },
            { text: 'O ambiente da nossa loja estava limpo e agradável?', type: 'rating_1_5', required: true },
            { text: 'Você tem alguma sugestão de novo sabor?', type: 'free_text', required: false },
            { text: 'De 0 a 10, qual a probabilidade de você nos recomendar?', type: 'rating_0_10', required: true }
          ]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'f6a7b8c9-d0e1-2345-6789-0abcdef56789',
        title: 'Açaí & Cafeteria',
        description: 'Modelo para lojas de açaí ou cafeterias, focado na qualidade dos produtos e opções de acompanhamento.',
        type: 'CSAT',
        targetAudience: 'Açaí/Cafeteria',
        isSystemTemplate: true,
        templateData: JSON.stringify({
          questions: [
            { text: 'Como você avalia a qualidade do nosso açaí/café?', type: 'rating_1_5', required: true },
            { text: 'O que você achou das nossas opções de acompanhamentos/adicionais?', type: 'rating_1_5', required: true },
            { text: 'O seu pedido foi preparado de forma rápida e correta?', type: 'rating_1_5', required: true },
            { text: 'De 0 a 10, qual a chance de você se tornar um cliente fiel?', type: 'rating_0_10', required: true }
          ]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const templateIds = templates.map(t => t.id);
    const existingTemplates = await queryInterface.sequelize.query(
      `SELECT id FROM survey_templates WHERE id IN (:templateIds)`,
      { replacements: { templateIds }, type: Sequelize.QueryTypes.SELECT }
    );
    const existingTemplateIds = new Set(existingTemplates.map(t => t.id));

    const templatesToInsert = templates.filter(t => !existingTemplateIds.has(t.id));

    if (templatesToInsert.length > 0) {
      await queryInterface.bulkInsert('survey_templates', templatesToInsert, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('survey_templates', {
      id: {
        [Sequelize.Op.in]: [
          'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
          'c3d4e5f6-a7b8-9012-3456-7890abcdef23',
          'd4e5f6a7-b8c9-0123-4567-890abcdef345',
          'e5f6a7b8-c9d0-1234-5678-90abcdef4567',
          'f6a7b8c9-d0e1-2345-6789-0abcdef56789'
        ]
      }
    }, {});
  }
};
