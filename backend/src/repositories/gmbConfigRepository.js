const { GmbConfig, Tenant } = require("../../models");

const gmbConfigRepository = {
  // Cria ou atualiza a configuração GMB para um tenant
  createOrUpdateConfig: async (tenantId, configData) => {
    const [config, created] = await GmbConfig.findOrCreate({
      where: { tenantId },
      defaults: { ...configData, tenantId },
    });

    if (!created) {
      await config.update(configData);
    }
    return config;
  },

  // Obtém a configuração GMB de um tenant
  getConfigByTenantId: async (tenantId) => {
    return GmbConfig.findOne({
      where: { tenantId },
    });
  },

  // Deleta a configuração GMB de um tenant
  deleteConfig: async (tenantId) => {
    return GmbConfig.destroy({
      where: { tenantId },
    });
  },
};

module.exports = gmbConfigRepository;
