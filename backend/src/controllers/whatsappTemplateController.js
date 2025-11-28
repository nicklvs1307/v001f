const whatsappTemplateRepository = require("../repositories/whatsappTemplateRepository");

class WhatsappTemplateController {
  async get(req, res, next) {
    try {
      const { tenantId } = req.user;
      const { type } = req.query;
      const template = await whatsappTemplateRepository.findByType(type, tenantId);
      if (!template) {
        return res.status(404).json({ message: "Template não encontrado." });
      }
      res.status(200).json(template);
    } catch (error) {
      next(error);
    }
  }

  async upsert(req, res, next) {
    try {
      const { tenantId } = req.user;
      const template = await whatsappTemplateRepository.upsert({
        ...req.body,
        tenantId,
      });
      res.status(200).json(template);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WhatsappTemplateController();
