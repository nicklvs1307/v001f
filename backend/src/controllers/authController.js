const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const authRepository = require("../repositories/authRepository");
const ApiError = require("../errors/ApiError");

// Função para registrar um Super Admin (exemplo inicial)
// Em um cenário real, isso seria feito de forma mais controlada.
exports.registerSuperAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Verificar se já existe um Super Admin
  const existingSuperAdmin = await authRepository.findSuperAdminUser();
  if (existingSuperAdmin) {
    throw new ApiError(403, "Super Admin já registrado. Não é possível registrar outro.");
  }

  // Verificar se o email já existe
  const userExists = await authRepository.findUserByEmail(email);
  if (userExists) {
    throw new ApiError(400, "Email já cadastrado.");
  }

  // Obter o ID do papel 'Super Admin'
  const superAdminRole = await authRepository.findRoleByName("Super Admin");
  if (!superAdminRole) {
    throw new ApiError(500, "Papel Super Admin não encontrado.");
  }
  const roleId = superAdminRole.id;

  // Hash da senha
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Inserir usuário no banco (sem tenantId para Super Admin)
  const newUser = await authRepository.createSuperAdminUser(
    roleId,
    name,
    email,
    passwordHash,
  );

  res.status(201).json({
    message: "Super Admin registrado com sucesso!",
    user: newUser,
  });
});

// Função de Login
exports.login = asyncHandler(async (req, res) => {
  console.log('Login request body:', req.body); // Debugging line
  const { email, password } = req.body;

  // Buscar usuário pelo email
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new ApiError(401, "Credenciais inválidas.");
  }

  // Verificar a senha
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Credenciais inválidas.");
  }

  // Obter o nome do papel (role)
  const roleName = await authRepository.getRoleNameByRoleId(user.roleId);

  // Gerar o token JWT
  const payload = {
    userId: user.id,
    tenantId: user.tenantId,
    role: roleName,
    name: user.name, // Adicionar o nome do usuário
    profilePictureUrl: user.profilePictureUrl, // Adicionar a URL da foto de perfil
    tenantName: user.tenant ? user.tenant.name : null, // Adicionar o nome do tenant
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({
    message: "Login bem-sucedido!",
    token,
  });
});

// Função para verificar o token
exports.verifyToken = asyncHandler(async (req, res) => {
  // O middleware de autenticação já validou o token e anexou os dados do usuário a req.user
  // Se chegamos aqui, o token é válido.
  // Apenas retornamos os dados do usuário para o frontend.
  res.json(req.user);
});
