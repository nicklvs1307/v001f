const { Tenant, WhatsappConfig } = require("../../models"); // Importa os modelos
const { Op } = require("sequelize");

const createTenant = async (tenantData) => {
  if (tenantData.cnpj === "") {
    tenantData.cnpj = null;
  }
  const newTenant = await Tenant.create(tenantData, {
    returning: [
      "id",
      "name",
      "address",
      "phone",
      "email",
      "cnpj",
      "description",
      "createdAt",
      "updatedAt",
    ],
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
    attributes: [
      "id",
      "name",
      "address",
      "phone",
      "email",
      "cnpj",
      "description",
      "createdAt",
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getTenantById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, id: tenantId } : { id };
  return Tenant.findByPk(id, {
    where: whereClause,
    attributes: [
      "id",
      "name",
      "address",
      "phone",
      "email",
      "cnpj",
      "description",
      "createdAt",
      "reportPhoneNumber",
    ],
    raw: true,
  });
};

const updateTenant = async (id, tenantData) => {
  const [updatedRows, [updatedTenant]] = await Tenant.update(tenantData, {
    where: { id },
    returning: [
      "id",
      "name",
      "address",
      "phone",
      "email",
      "cnpj",
      "description",
      "createdAt",
      "updatedAt",
    ],
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
    attributes: ["logoUrl"],
  });
  return tenant ? tenant.logoUrl : null;
};

const findAllWithReportPhoneNumber = async () => {
  return Tenant.findAll({
    where: {
      reportPhoneNumber: {
        [Op.ne]: null,
        [Op.not]: "",
      },
    },
    attributes: ["id", "name", "reportPhoneNumber"],
  });
};

const findByName = async (name) => {
  return Tenant.findOne({ where: { name } });
};

const update = async (id, data) => {
  const [updatedRows] = await Tenant.update(data, {
    where: { id },
    returning: true,
  });
  if (updatedRows > 0) {
    return Tenant.findByPk(id, { raw: true });
  }
  return null;
};
module.exports = {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantLogoUrlById,
  findAllWithReportPhoneNumber,
  update, // Adicionando a nova função
};
