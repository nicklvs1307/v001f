const { WhatsappConfig, Tenant } = require('../../models');

class WhatsappConfigRepository {
  async findByTenant(tenantId) {
    const { WhatsappConfig } = require('../../models');
    return await WhatsappConfig.findOne({ where: { tenantId } });
  }

  async upsert(tenantId, data) {
    const { WhatsappConfig, sequelize } = require('../../models');
  
    return sequelize.transaction(async (t) => {
      // 1. Encontra a configuração existente para obter os campos não relacionados à automação
      const existingConfig = await WhatsappConfig.findOne({
        where: { tenantId },
        raw: true, // Retorna um objeto simples, não uma instância do Sequelize
        transaction: t,
      });
  
      // 2. Deleta o registro existente para evitar conflitos de chave única e triggers
      await WhatsappConfig.destroy({
        where: { tenantId },
        transaction: t,
      });
  
      // 3. Mescla os dados existentes (se houver) com os novos dados
      // Isso garante que `url` e `apiKey` sejam preservados.
      const mergedData = {
        ...existingConfig,
        ...data,
        tenantId,
      };
  
      // Remove o ID antigo para que o banco de dados gere um novo
      delete mergedData.id;
  
      // 4. Cria um novo registro com os dados mesclados
      const newConfig = await WhatsappConfig.create(mergedData, {
        transaction: t,
      });
  
      return newConfig;
    });
  }

  async findAllWithDailyReportEnabled() {
    const { Op } = require('sequelize');
    return await WhatsappConfig.findAll({
      where: {
        dailyReportEnabled: true,
        reportPhoneNumbers: {
          [Op.ne]: null,
          [Op.not]: ''
        }
      },
      raw: true,
    });
  }

  async deleteByTenantId(tenantId) {
    return await WhatsappConfig.destroy({ where: { tenantId } });
  }
}

module.exports = new WhatsappConfigRepository();
