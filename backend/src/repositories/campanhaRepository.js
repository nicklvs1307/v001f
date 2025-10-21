const { Campanha } = require('../../models');
const ApiError = require('../errors/ApiError');

class CampanhaRepository {
  async create(data) {
    return Campanha.create(data);
  }

  async findAll(tenantId) {
    return Campanha.findAll({ where: { tenantId } });
  }

  async findById(id, tenantId) {
    const campanha = await Campanha.findOne({ where: { id, tenantId } });
    if (!campanha) {
      throw ApiError.notFound('Campanha não encontrada.');
    }
    return campanha;
  }

  async update(id, data, tenantId) {
    // Garante que a campanha exista para o tenant antes de tentar atualizar
    await this.findById(id, tenantId);
    
    // Executa a atualização usando o 'where' para garantir a atomicidade
    const [updatedRows] = await Campanha.update(data, {
      where: { id, tenantId },
    });

    if (updatedRows === 0) {
      throw ApiError.notFound('Campanha não encontrada para atualização.');
    }

    return this.findById(id, tenantId); // Retorna a instância atualizada
  }

  async delete(id, tenantId) {
    const campanha = await this.findById(id, tenantId);
    return campanha.destroy();
  }
}

module.exports = new CampanhaRepository();
