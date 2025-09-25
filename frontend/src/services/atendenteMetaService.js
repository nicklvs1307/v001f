import apiAuthenticated from './apiAuthenticated';

const BASE_URL = '/atendenteMetas';

const atendenteMetaService = {
  // Corresponds to GET /atendente-metas/metas
  getAllMetasByTenant: async () => {
    const response = await apiAuthenticated.get(`${BASE_URL}/metas`);
    return response.data;
  },

  // Corresponds to GET /atendente-metas/:atendenteId/metas
  getMetaByAtendenteId: async (atendenteId) => {
    const response = await apiAuthenticated.get(`${BASE_URL}/${atendenteId}/metas`);
    return response.data;
  },

  // Corresponds to POST /atendente-metas/:atendenteId/metas
  createOrUpdateMeta: async (atendenteId, metaData) => {
    const response = await apiAuthenticated.post(`${BASE_URL}/${atendenteId}/metas`, metaData);
    return response.data;
  },

  // Corresponds to DELETE /atendente-metas/:atendenteId/metas
  deleteMeta: async (atendenteId) => {
    const response = await apiAuthenticated.delete(`${BASE_URL}/${atendenteId}/metas`);
    return response.data;
  },
};

export default atendenteMetaService;