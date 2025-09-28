const { WhatsappTemplate } = require('../../models');

class WhatsappTemplateRepository {
  async findOne(tenantId, type) {
    return WhatsappTemplate.findOne({ where: { tenantId, type } });
  }

  async upsert(templateData) {
    const { tenantId, type } = templateData;
    const existing = await this.findOne(tenantId, type);

    if (existing) {
      return existing.update(templateData);
    } else {
      return WhatsappTemplate.create(templateData);
    }
  }
}

module.exports = new WhatsappTemplateRepository();
