const { Tenant, WhatsappConfig, Role, Usuario } = require("../../models"); // Importa os modelos
const { Op } = require("sequelize");
const { sequelize } = require("../database"); // Import sequelize instance

const createTenantWithAdmin = async (tenantData, adminData) => {
  const t = await sequelize.transaction();
  try {
    if (tenantData.cnpj === "") {
      tenantData.cnpj = null;
    }
    
    // 1. Criar o Tenant
    const newTenant = await Tenant.create(tenantData, { transaction: t });

    // 2. Encontrar o Role de Admin
    const adminRole = await Role.findOne({ where: { name: 'Admin' } }, { transaction: t });
    if (!adminRole) {
      throw new Error("O papel 'Admin' não foi encontrado. Execute os seeders.");
    }

    // 3. Criar o Usuário Admin (senha já vem hasheada do controller)
    const adminUser = await Usuario.create({
      tenantId: newTenant.id,
      roleId: adminRole.id,
      name: adminData.name,
      email: adminData.email,
      passwordHash: adminData.passwordHash, // Espera-se a senha já hasheada
      franchisorId: newTenant.franchisorId, // Se aplicável
    }, { transaction: t });

    await t.commit();

    // Retornar dados limpos
    const tenantResult = { ...newTenant.get({ plain: true }) };
    const userResult = { ...adminUser.get({ plain: true }) };
    delete userResult.passwordHash;

    return { tenant: tenantResult, user: userResult };

  } catch (error) {
    await t.rollback();
    throw error; // Re-throw para ser tratado pelo asyncHandler no controller
  }
};

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
      "franchisorId",
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
    franchisorId: newTenant.franchisorId,
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
  // Filtra quaisquer chaves que tenham valor `undefined` para evitar erros.
  const filteredData = Object.keys(tenantData).reduce((acc, key) => {
    if (tenantData[key] !== undefined) {
      acc[key] = tenantData[key];
    }
    return acc;
  }, {});

  if (Object.keys(filteredData).length === 0) {
    // Nenhum dado para atualizar, retorna o tenant atual para evitar uma query desnecessária.
    return Tenant.findByPk(id);
  }

  const [updatedRows] = await Tenant.update(filteredData, {
    where: { id },
  });

  if (updatedRows === 0) {
    return null;
  }

  // Retorna a instância atualizada para garantir que o chamador receba os dados mais recentes.
  return Tenant.findByPk(id);
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

const findByUaiRangoId = async (uairangoEstablishmentId) => {
  return Tenant.findOne({ where: { uairangoEstablishmentId } });
};

module.exports = {
  createTenantWithAdmin,
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantLogoUrlById,
  findAllWithReportPhoneNumber,
  findByName,
  findByUaiRangoId, // Adicionar a nova função
};
