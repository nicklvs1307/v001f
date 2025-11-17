const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const ApiError = require("../errors/ApiError");
const fs = require('fs');
const path = require('path');

// @desc    Criar um novo usuário (para um tenant específico)
// @access  Private (Super Admin ou Admin)
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, roleId, tenantId } = req.body;
  const requestingUser = req.user; // Usuário que está fazendo a requisição

  // Super Admin pode criar usuários para qualquer tenant ou Super Admin
  // Admin só pode criar usuários para o seu próprio tenant
  const targetTenantId =
    requestingUser.role === "Super Admin" && tenantId
      ? tenantId
      : requestingUser.tenantId;

  if (!targetTenantId) {
    throw new ApiError(400, "Tenant ID é obrigatório para criar um usuário.");
  }

  // Verificar se o email já existe
  const userExists = await userRepository.findByEmail(email);
  if (userExists) {
    throw new ApiError(400, "Email já cadastrado.");
  }

  // Verificar se o roleId existe e se é um role válido para o tenant (se aplicável)
  const role = await userRepository.findRoleById(roleId);
  if (!role) {
    throw new ApiError(400, "Papel (role) inválido.");
  }

  // Um Admin não pode criar um Super Admin
  if (requestingUser.role !== "Super Admin" && role.name === "Super Admin") {
    throw new ApiError(403, "Você não pode criar um Super Admin.");
  }

  // Hash da senha
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Inserir usuário no banco
  const newUser = await userRepository.createUser(
    targetTenantId,
    roleId,
    name,
    email,
    passwordHash,
  );

  // --- NOTIFICATION ---
  const io = req.app.get('io');
  const notificationService = require('../services/NotificationService');
  await notificationService.createNotification(io, {
    type: 'NEW_USER',
    message: `Novo usuário criado: ${name}`,
    tenantId: targetTenantId,
    userId: req.user.id
  });
  // --- END NOTIFICATION ---

  res.status(201).json({
    message: "Usuário criado com sucesso!",
    user: newUser,
  });
});

// @desc    Listar usuários
// @access Private (Super Admin ou Admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const requestingUser = req.user;
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;
  const users = await userRepository.getUsers(tenantId);
  res.status(200).json(users);
});

// @desc    Obter um usuário por ID
// @access  Private (Super Admin ou Admin)
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  const user = await userRepository.findById(id, tenantId);

  if (!user) {
    throw new ApiError(404, "Usuário não encontrado.");
  }

  // Super Admin pode ver qualquer usuário
  // Admin só pode ver usuários do seu próprio tenant
  if (
    requestingUser.role !== "Super Admin" &&
    user.tenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(403, "Você não tem permissão para ver este usuário.");
  }

  res.status(200).json(user);
});

// @desc    Atualizar um usuário
// @access  Private (Super Admin ou Admin)
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, roleId, password } = req.body;
  const requestingUser = req.user;
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  const existingUser = await userRepository.findUserById(id, tenantId);
  if (!existingUser) {
    throw new ApiError(404, "Usuário não encontrado.");
  }

  // Super Admin pode atualizar qualquer usuário
  // Tenant Admin só pode atualizar usuários do seu próprio tenant
  // Usuário comum só pode atualizar a si mesmo
  if (
    requestingUser.userId !== id && // Se não for o próprio usuário
    requestingUser.role !== "Super Admin" && // E não for Super Admin
    !(requestingUser.role === "Admin" && existingUser.tenantId === requestingUser.tenantId) // E não for Admin do mesmo tenant
  ) {
    throw new ApiError(
      403,
      "Você não tem permissão para atualizar este usuário.",
    );
  }

  // Um Admin não pode alterar o papel de um usuário para Super Admin
  if (requestingUser.role !== "Super Admin" && roleId) {
    const newRole = await userRepository.findRoleById(roleId);
    if (newRole && newRole.name === "Super Admin") {
      throw new ApiError(403, "Você não pode atribuir o papel de Super Admin.");
    }
  }

  let passwordHash;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(password, salt);
  }

  const updatedUser = await userRepository.updateUser(
    id,
    name,
    email,
    roleId,
    passwordHash,
  );

  res.status(200).json({
    message: "Usuário atualizado com sucesso!",
    user: updatedUser,
  });
});

// @desc    Upload de foto de perfil para um usuário
// @route   POST /api/users/:id/upload-profile-picture
// @access  Private (Usuário logado, Admin, Super Admin)
exports.uploadProfilePicture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    throw new ApiError(400, "Nenhum arquivo enviado.");
  }

  const oldProfilePictureUrl = await userRepository.getUserProfilePictureUrlById(id);

  // O caminho do arquivo é relativo à raiz do projeto, mas precisamos de um caminho acessível via URL
  // Assumindo que 'uploads' é servido estaticamente em /uploads
  const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;

  const updatedUser = await userRepository.updateUser(id, null, null, null, null, profilePictureUrl); // Apenas atualiza a foto de perfil

  if (!updatedUser) {
    // Se o usuário não for encontrado para atualização, deletar o arquivo recém-enviado
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'profile-pictures', req.file.filename);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
        console.error(`Arquivo recém-enviado ${filePath} deletado devido a falha na atualização do usuário.`);
      } catch (unlinkError) {
        console.error(`Erro ao deletar arquivo recém-enviado ${filePath}:`, unlinkError);
      }
    }
    throw new ApiError(404, "Usuário não encontrado para atualização da foto de perfil.");
  }

  // Se houver uma foto de perfil antiga e ela for diferente da nova, deletá-la
  if (oldProfilePictureUrl && oldProfilePictureUrl !== profilePictureUrl) {
    const oldFilePath = path.join(__dirname, '..', '..', oldProfilePictureUrl);
    if (fs.existsSync(oldFilePath)) {
      try {
        await fs.promises.unlink(oldFilePath);

      } catch (unlinkError) {
        console.error(`Erro ao deletar arquivo antigo ${oldFilePath}:`, unlinkError);
      }
    }
  }

  res.status(200).json({
    message: "Foto de perfil atualizada com sucesso!",
    profilePictureUrl: updatedUser.profilePictureUrl,
  });
});

// @desc    Deletar um usuário
// @route   DELETE /api/users/:id
// @access  Private (Super Admin ou Tenant Admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;
  const tenantId = requestingUser.role === 'Super Admin' ? null : requestingUser.tenantId;

  const existingUser = await userRepository.findUserById(id, tenantId);
  if (!existingUser) {
    throw new ApiError(404, "Usuário não encontrado.");
  }

  // Super Admin pode deletar qualquer usuário
  // Admin só pode deletar usuários do seu próprio tenant
  if (
    requestingUser.role !== "Super Admin" &&
    existingUser.tenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(
      403,
      "Você não tem permissão para deletar este usuário.",
    );
  }

  // Não permitir que um usuário se delete
  if (requestingUser.userId === id) {
    throw new ApiError(403, "Você não pode deletar seu próprio usuário.");
  }

  const deletedRowCount = await userRepository.deleteUser(id);

  if (deletedRowCount === 0) {
    throw new ApiError(404, "Usuário não encontrado para deleção.");
  }

  res.status(200).json({ message: "Usuário deletado com sucesso." });
});
