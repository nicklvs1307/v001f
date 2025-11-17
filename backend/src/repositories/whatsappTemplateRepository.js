const { WhatsappTemplate } = require("../../models");

class WhatsappTemplateRepository {
  async findByType(type, tenantId) {
    return await WhatsappTemplate.findOne({ where: { type, tenantId } });
  }

  async upsert(data) {
    const { type, tenantId } = data;
    const existingTemplate = await this.findByType(type, tenantId);

    if (existingTemplate) {
      await WhatsappTemplate.update(data, { where: { type, tenantId } });
    } else {
      await WhatsappTemplate.create(data);
    }
    return await this.findByType(type, tenantId);
  }
}

module.exports = new WhatsappTemplateRepository();
