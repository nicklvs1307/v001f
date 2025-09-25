const { AtendenteMeta, Atendente, Tenant } = require("../../models");
const { Op } = require('sequelize');

const atendenteMetaRepository = {
  // Cria ou atualiza a meta de um atendente
  createOrUpdateMeta: async (atendenteId, tenantId, metaData) => {
    const [meta, created] = await AtendenteMeta.findOrCreate({
      where: { atendenteId, tenantId },
      defaults: { ...metaData, atendenteId, tenantId },
    });

    if (!created) {
      await meta.update(metaData);
    }
    return meta;
  },

  // Obtém a meta de um atendente específico
  getMetaByAtendenteId: async (atendenteId, tenantId) => {
    return AtendenteMeta.findOne({
      where: { atendenteId, tenantId },
      include: [
        { model: Atendente, as: 'atendente', attributes: ['name'] },
      ],
    });
  },

  // Obtém todas as metas de atendentes de um tenant
  getAllMetasByTenant: async (tenantId) => {
    return AtendenteMeta.findAll({
      where: { tenantId },
      include: [
        { model: Atendente, as: 'atendente', attributes: ['name'] },
      ],
      order: [['atendente', 'name', 'ASC']],
    });
  },

  // Deleta a meta de um atendente
  deleteMeta: async (atendenteId, tenantId) => {
    return AtendenteMeta.destroy({
      where: { atendenteId, tenantId },
    });
  },
};

module.exports = atendenteMetaRepository;
