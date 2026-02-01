const asyncHandler = require("express-async-handler");
const tenantRepository = require("../repositories/tenantRepository");
const ApiError = require("../errors/ApiError");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

// @desc    Criar um novo tenant com seu usuário admin
// @route   POST /api/tenants
// @access  Private (Super Admin)
exports.createTenant = asyncHandler(async (req, res) => {
  const {
    name,
    address,
    phone,
    email,
    cnpj,
    description, // Tenant data
    adminName,
    adminEmail,
    adminPassword, // Admin user data
    franchisorId, // Optional: provided by Super Admin
  } = req.body;
  const requestingUser = req.user;

  // Validação
  if (!name || !adminName || !adminEmail || !adminPassword) {
    throw new ApiError(
      400,
      "Dados da empresa e do administrador são obrigatórios.",
    );
  }

  // Hash da senha do admin
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const tenantData = { name, address, phone, email, cnpj, description };
  const adminData = {
    name: adminName,
    email: adminEmail,
    passwordHash: passwordHash,
  };

  // Se for Franqueador logado, força o ID dele. Se for Super Admin, aceita o ID vindo do body.
  if (requestingUser.role.name === "Franqueador") {
    tenantData.franchisorId = requestingUser.franchisorId;
  } else if (requestingUser.role.name === "Super Admin" && franchisorId) {
    tenantData.franchisorId = franchisorId;
  }

  // Chamar a nova função transacional no repositório
  const { tenant: newTenant, user: newAdmin } =
    await tenantRepository.createTenantWithAdmin(tenantData, adminData);

  res.status(201).json({
    message: "Tenant e usuário administrador criados com sucesso!",
    tenant: newTenant,
    user: newAdmin,
  });
});

// @desc    Listar tenants
// @route   GET /api/tenants
// @access  Private (Super Admin)
exports.getTenants = asyncHandler(async (req, res) => {
  const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;
  const tenants = await tenantRepository.getTenants(tenantId);
  res.status(200).json(tenants);
});

// @desc    Obter um tenant por ID
// @route   GET /api/tenants/:id
// @access  Private (Super Admin)
exports.getTenantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.role === "Super Admin" ? null : req.user.tenantId;

  const tenant = await tenantRepository.getTenantById(id, tenantId);

  if (!tenant) {
    throw new ApiError(404, "Tenant não encontrado.");
  }

  res.status(200).json(tenant);
});

// @desc    Atualizar um tenant
// @route   PUT /api/tenants/:id
// @access  Private (Super Admin)
exports.updateTenant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    address,
    phone,
    email,
    cnpj,
    description,
    logoUrl,
    primaryColor,
    secondaryColor,
  } = req.body;

  const updatedTenant = await tenantRepository.updateTenant(id, {
    name,
    address,
    phone,
    email,
    cnpj,
    description,
    logoUrl,
    primaryColor,
    secondaryColor,
  });

  if (!updatedTenant) {
    throw new ApiError(404, "Tenant não encontrado para atualização.");
  }

  res.status(200).json({
    message: "Tenant atualizado com sucesso!",
    tenant: updatedTenant,
  });
});

// @desc    Deletar um tenant
// @route   DELETE /api/tenants/:id
// @access  Private (Super Admin)
exports.deleteTenant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedRowCount = await tenantRepository.deleteTenant(id);

  if (deletedRowCount === 0) {
    throw new ApiError(404, "Tenant não encontrado para deleção.");
  }

  res.status(200).json({ message: "Tenant deletado com sucesso." });
});

// @desc    Upload de logo para um tenant
// @route   POST /api/tenants/:id/upload-logo
// @access  Private (Super Admin, Admin do Tenant)
exports.uploadLogo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    throw new ApiError(400, "Nenhum arquivo enviado.");
  }

  const oldLogoUrl = await tenantRepository.getTenantLogoUrlById(id);

  // O caminho do arquivo é relativo à raiz do projeto, mas precisamos de um caminho acessível via URL
  // Assumindo que 'uploads' é servido estaticamente em /uploads
  const logoUrl = `/uploads/logos/${req.file.filename}`;

  const updatedTenant = await tenantRepository.updateTenant(id, { logoUrl });

  if (!updatedTenant) {
    // Se o tenant não for encontrado para atualização, deletar o arquivo recém-enviado
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "logos",
      req.file.filename,
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new ApiError(404, "Tenant não encontrado para atualização da logo.");
  }

  // Se houver uma logo antiga e ela for diferente da nova, deletá-la
  if (oldLogoUrl && oldLogoUrl !== logoUrl) {
    const oldFilePath = path.join(__dirname, "..", "..", oldLogoUrl);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  res.status(200).json({
    message: "Logo atualizada com sucesso!",
    logoUrl: updatedTenant.logoUrl,
  });
});

// @desc    Obter o tenant do usuário logado
// @route   GET /api/tenants/me
// @access  Private (Admin do Tenant)
exports.getMe = asyncHandler(async (req, res) => {
  const { tenantId } = req.user;

  if (!tenantId) {
    throw new ApiError(404, "Tenant não encontrado para este usuário.");
  }

  const tenant = await tenantRepository.getTenantById(tenantId);

  if (!tenant) {
    throw new ApiError(404, "Tenant não encontrado.");
  }

  res.status(200).json(tenant);
});

// @desc    Atualizar o tenant do usuário logado
// @route   PUT /api/tenants/me
// @access  Private (Admin do Tenant)
exports.updateMe = asyncHandler(async (req, res) => {
  const { tenantId } = req.user;
  const {
    name,
    address,
    phone,
    email,
    cnpj,
    description,
    reportPhoneNumber,
    uairangoEstablishmentId,
    deliveryMuchClientId,
    deliveryMuchClientSecret,
    deliveryMuchUsername,
    deliveryMuchPassword,
    primaryColor,
    secondaryColor,
  } = req.body;

  if (!tenantId) {
    throw new ApiError(404, "Tenant não encontrado para este usuário.");
  }

  // Campos permitidos para atualização pelo próprio tenant
  const allowedUpdates = {
    name,
    address,
    phone,
    email,
    cnpj,
    description,
    reportPhoneNumber,
    uairangoEstablishmentId,
    deliveryMuchClientId,
    deliveryMuchClientSecret,
    deliveryMuchUsername,
    deliveryMuchPassword,
    primaryColor,
    secondaryColor,
  };

  const updatedTenant = await tenantRepository.updateTenant(
    tenantId,
    allowedUpdates,
  );

  if (!updatedTenant) {
    throw new ApiError(404, "Tenant não encontrado para atualização.");
  }

  res
    .status(200)
    .json({ message: "Tenant atualizado com sucesso.", tenant: updatedTenant });
});
