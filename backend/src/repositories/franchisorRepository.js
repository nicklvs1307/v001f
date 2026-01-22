    const { Franchisor, Tenant } = require('../../models');

const franchisorRepository = {
    // ... (create, findAll, etc.)

    /**
     * Encontra uma franqueadora pelo seu ID, incluindo seus Tenants.
     * @param {string} id - O UUID da franqueadora.
     * @returns {Promise<Franchisor|null>} O objeto da franqueadora ou nulo se não encontrada.
     */
    async findById(id) {
        return await Franchisor.findByPk(id, {
            include: [{
                model: Tenant,
                as: 'tenants',
                attributes: ['id', 'name', 'city', 'state', 'status', 'logoUrl', 'phone', 'createdAt'], // Adicionei campos úteis
            }],
        });
    },

    /**
     * Atualiza uma franqueadora existente.
     * @param {string} id - O UUID da franqueadora a ser atualizada.
     * @param {object} franchisorData - Novos dados para a franqueadora.
     * @returns {Promise<Franchisor|null>} O objeto da franqueadora atualizada ou nulo.
     */
    async update(id, franchisorData) {
        const franchisor = await Franchisor.findByPk(id);
        if (franchisor) {
            return await franchisor.update(franchisorData);
        }
        return null;
    },

    /**
     * Deleta uma franqueadora.
     * @param {string} id - O UUID da franqueadora a ser deletada.
     * @returns {Promise<number>} O número de registros deletados (0 ou 1).
     */
    async delete(id) {
        const franchisor = await Franchisor.findByPk(id);
        if (franchisor) {
            await franchisor.destroy();
            return 1; // Retorna 1 para indicar que a deleção ocorreu.
        }
        return 0; // Retorna 0 se nenhuma franqueadora foi encontrada.
    },
};

module.exports = franchisorRepository;
