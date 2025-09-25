const configRepository = require('../repositories/configRepository');
const ApiError = require('../errors/ApiError');
const asyncHandler = require("express-async-handler");

class ConfigController {
  async getTenantConfig(req, res) {
    const { tenantId } = req.user;

    let config = await configRepository.getTenantConfig(tenantId);

    if (!config) {
      // Se não encontrar o tenant, retorna uma configuração padrão para evitar que o front-end quebre.
      // Idealmente, um usuário logado sempre deveria ter um tenant válido.
      config = {
        name: 'Nome do Restaurante',
        primaryColor: '#6a11cb',
        secondaryColor: '#2575fc',
        logoUrl: null,
      };
    } else {
        // Garante que as cores tenham um valor padrão se forem nulas
        config.primaryColor = config.primaryColor || '#6a11cb';
        config.secondaryColor = config.secondaryColor || '#2575fc';
    }

    res.status(200).json(config);
  }

  async updateTenantConfig(req, res) {
    const { tenantId } = req.user; // Assumindo que o tenantId está no objeto user do req

    const configData = req.body;
    const updatedConfig = await configRepository.updateTenantConfig(tenantId, configData);

    if (!updatedConfig) {
      throw new ApiError('Configurações do Tenant não encontradas para atualização.', 404);
    }

    res.status(200).json(updatedConfig);
  }
}

module.exports = new ConfigController();