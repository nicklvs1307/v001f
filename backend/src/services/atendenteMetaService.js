const atendenteMetaRepository = require("../repositories/atendenteMetaRepository");

const createOrUpdateMeta = (atendenteId, tenantId, metaData) => {
  return atendenteMetaRepository.createOrUpdateMeta(
    atendenteId,
    tenantId,
    metaData,
  );
};

const getMetaByAtendenteId = (atendenteId, tenantId) => {
  return atendenteMetaRepository.getMetaByAtendenteId(atendenteId, tenantId);
};

const getAllMetasByTenant = (tenantId) => {
  return atendenteMetaRepository.getAllMetasByTenant(tenantId);
};

const deleteMeta = (atendenteId, tenantId) => {
  return atendenteMetaRepository.deleteMeta(atendenteId, tenantId);
};

module.exports = {
  createOrUpdateMeta,
  getMetaByAtendenteId,
  getAllMetasByTenant,
  deleteMeta,
};
