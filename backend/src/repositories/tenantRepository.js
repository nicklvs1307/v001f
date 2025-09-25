const { Tenant, WhatsappConfig } = require("../../models"); // Importa os modelos
const { Op } = require('sequelize');

const createTenant = async (tenantData) => {
  const newTenant = await Tenant.create(tenantData, {
    returning: ['id', 'name', 'address', 'phone', 'email', 'cnpj', 'description', 'createdAt', 'updatedAt']
  });
  return {
    id: newTenant.id,
    name: newTenant.name,
    address: newTenant.address,
    phone: newTenant.phone,
    email: newTenant.email,
    cnpj: newTenant.cnpj,
    description: newTenant.description,
    createdAt: newTenant.createdAt,
  };
};

const getTenants = async (tenantId = null) => {
  const whereClause = tenantId ? { id: tenantId } : {};
  return Tenant.findAll({
    where: whereClause,
    attributes: ['id', 'name', 'address', 'phone', 'email', 'cnpj', 'description', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
};

const getTenantById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, id: tenantId } : { id }; // Garante que o ID do tenant seja o mesmo do filtro
  return Tenant.findByPk(id, {
    where: whereClause,
    attributes: ['id', 'name', 'address', 'phone', 'email', 'cnpj', 'description', 'createdAt'],
  });
};

const updateTenant = async (id, tenantData) => {
  const [updatedRows, [updatedTenant]] = await Tenant.update(tenantData, {
    where: { id },
    returning: ['id', 'name', 'address', 'phone', 'email', 'cnpj', 'description', 'createdAt', 'updatedAt']
  });

  if (updatedRows === 0) {
    return null;
  }

  return updatedTenant;
};

const deleteTenant = async (id) => {
  const deletedRows = await Tenant.destroy({
    where: { id },
  });
  return deletedRows;
};

const getTenantLogoUrlById = async (id) => {
  const tenant = await Tenant.findByPk(id, {
    attributes: ['logoUrl'],
  });
  return tenant ? tenant.logoUrl : null;
};

const findAllWithActiveWhatsapp = async () => {
  return Tenant.findAll({
    where: {
      reportPhoneNumber: {
        [Op.ne]: null // Garante que o número de telefone para relatórios não seja nulo
      }
    },
    include: [{
      model: WhatsappConfig,
      as: 'whatsappConfig',
      where: {
        instanceStatus: 'connected' // Garante que a instância do WhatsApp esteja conectada
      },
      required: true // Faz um INNER JOIN para garantir que apenas tenants com config ativa sejam retornados
    }]
  });
};

const findByName = async (name) => {
  return Tenant.findOne({ where: { name } });
};

module.exports = {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantLogoUrlById,
  findAllWithActiveWhatsapp,
};
