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
    const campanha = await this.findById(id, tenantId);
    return campanha.update(data);
  }

  async delete(id, tenantId) {
    const campanha = await this.findById(id, tenantId);
    return campanha.destroy();
  }
}

module.exports = new CampanhaRepository();
