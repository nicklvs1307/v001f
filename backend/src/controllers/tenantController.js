const asyncHandler = require("express-async-handler");
const tenantRepository = require("../repositories/tenantRepository");
const ApiError = require("../errors/ApiError");
const fs = require('fs');
const path = require('path');

// @desc    Criar um novo tenant
// @route   POST /api/tenants
// @access  Private (Super Admin)
exports.createTenant = asyncHandler(async (req, res) => {
  const { name, address, phone, email, cnpj, description } = req.body;

  const newTenant = await tenantRepository.createTenant({ name, address, phone, email, cnpj, description });

  res.status(201).json({
    message: "Tenant criado com sucesso!",
    tenant: newTenant,
  });
});

// @desc    Listar tenants
// @route   GET /api/tenants
// @access  Private (Super Admin)
exports.getTenants = asyncHandler(async (req, res) => {
  const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;
  const tenants = await tenantRepository.getTenants(tenantId);
  res.status(200).json(tenants);
});

// @desc    Obter um tenant por ID
// @route   GET /api/tenants/:id
// @access  Private (Super Admin)
exports.getTenantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.role === 'Super Admin' ? null : req.user.tenantId;

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
  const { name, address, phone, email, cnpj, description, logoUrl, primaryColor, secondaryColor } = req.body;

  const updatedTenant = await tenantRepository.updateTenant(id, { name, address, phone, email, cnpj, description, logoUrl, primaryColor, secondaryColor });

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
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'logos', req.file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new ApiError(404, "Tenant não encontrado para atualização da logo.");
  }

  // Se houver uma logo antiga e ela for diferente da nova, deletá-la
  if (oldLogoUrl && oldLogoUrl !== logoUrl) {
    const oldFilePath = path.join(__dirname, '..', '..', oldLogoUrl);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  res.status(200).json({
    message: "Logo atualizada com sucesso!",
    logoUrl: updatedTenant.logoUrl,
  });
});
