const asyncHandler = require("express-async-handler");
const clientRepository = require("../repositories/clientRepository");
const publicSurveyRepository = require("../repositories/publicSurveyRepository");
const { sequelize } = require("../database");
const ApiError = require("../errors/ApiError");

const whatsappService = require("../services/whatsappService");

// @desc    Criar ou atualizar um cliente (público)
// @access  Public
exports.publicRegisterClient = asyncHandler(async (req, res) => {
  const { name, email, phone, birthDate, respondentSessionId } = req.body;

  // Validações básicas
  if (!name || !respondentSessionId) {
    throw new ApiError(400, "Nome e ID da sessão de resposta são obrigatórios.");
  }

  const transaction = await sequelize.transaction();

  try {
    const tenantId = await publicSurveyRepository.findTenantIdBySession(respondentSessionId);
    if (!tenantId) {
      throw new ApiError(404, "Sessão de pesquisa não encontrada ou inválida.");
    }

    // Verificar unicidade de Email e Telefone antes de qualquer outra coisa
    if (email) {
      const existingClientByEmail = await clientRepository.findClientByEmail(email);
      if (existingClientByEmail) {
        throw new ApiError(409, "Email já existe.");
      }
    }

    if (phone) {
      const existingClientByPhone = await clientRepository.findClientByPhone(phone);
      if (existingClientByPhone) {
        throw new ApiError(409, "WhatsApp já existe.");
      }
    }

    // Tenta encontrar o cliente anônimo criado na etapa anterior
    let client = await clientRepository.getClientByRespondentSessionId(respondentSessionId);

    if (client && client.name.startsWith('Cliente Anônimo')) {
      // Se encontrou o cliente anônimo, atualiza com os dados do formulário
      const updatedClient = await clientRepository.updateClient(
        client.id,
        { name, email, phone, birthDate },
        tenantId,
        { transaction }
      );
      await transaction.commit();
      return res.status(200).json({
        message: "Cliente atualizado com sucesso!",
        client: updatedClient,
      });
    } else if (client) {
      // Se um cliente com a mesma sessão já existe e não é anônimo,
      // isso indica um novo registro para uma pesquisa já concluída, o que é um caso raro.
      // Apenas retornamos o cliente existente.
      await transaction.commit();
      return res.status(200).json({
        message: "Cliente já registrado para esta sessão.",
        client: client,
      });
    }

    // Se não encontrou nenhum cliente pela sessão, cria um novo
    const newClient = await clientRepository.createClient(
      { name, email, phone, birthDate, tenantId, respondentSessionId },
      { transaction }
    );

    // Vincular as respostas ao cliente recém-criado
    await publicSurveyRepository.linkResponsesToClient(respondentSessionId, newClient.id, transaction);

    await transaction.commit();

    res.status(201).json({
      message: "Cliente cadastrado com sucesso!",
      client: newClient,
    });

  } catch (error) {
    await transaction.rollback();
    // Garante que o erro seja relançado para o middleware de erro
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Erro interno no servidor.");
  }
});

// @desc    Criar um novo cliente
// @access  Private (Admin)
exports.createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, birthDate } = req.body;
  const tenantId = req.user.tenantId; // Associa o cliente ao tenant do usuário logado

  if (!name) {
    throw new ApiError(400, "O nome do cliente é obrigatório.");
  }

  const newClient = await clientRepository.createClient({ name, email, phone, birthDate, tenantId });

  res.status(201).json({
    message: "Cliente criado com sucesso!",
    client: newClient,
  });
});

// @desc    Listar clientes
// @access  Private (Admin)
exports.getAllClients = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  let { page = 1, limit = 10, orderBy = 'name', order = 'asc', filter = '' } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }


  // Lista de colunas permitidas para ordenação
  const allowedOrderBy = ['name', 'email', 'phone', 'birthDate', 'createdAt'];
  if (!allowedOrderBy.includes(orderBy)) {
    orderBy = 'name'; // Padrão seguro
  }

  // Validar a ordem
  if (!['asc', 'desc'].includes(order.toLowerCase())) {
    order = 'asc'; // Padrão seguro
  }

  const { clients, total } = await clientRepository.findAndCountAllByTenant(
    tenantId,
    parseInt(page),
    parseInt(limit),
    orderBy,
    order,
    filter
  );

  res.status(200).json({ clients, total });
});

// @desc    Obter um cliente por ID
// @access  Private (Admin)
exports.getClientById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  const client = await clientRepository.getClientById(id, tenantId);

  if (!client) {
    throw new ApiError(404, "Cliente não encontrado.");
  }

  res.status(200).json(client);
});

// @desc    Obter detalhes de um cliente por ID
// @access  Private (Admin)
exports.getClientDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  const clientDetails = await clientRepository.getClientDetails(id, tenantId);

  if (!clientDetails) {
    throw new ApiError(404, "Cliente não encontrado.");
  }

  res.status(200).json(clientDetails);
});

// @desc    Atualizar um cliente
// @access  Private (Admin)
exports.updateClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, birthDate } = req.body;
  const tenantId = req.user.tenantId;

  if (!name) {
    throw new ApiError(400, "O nome do cliente é obrigatório.");
  }

  const updatedClient = await clientRepository.updateClient(id, { name, email, phone, birthDate }, tenantId);

  if (!updatedClient) {
    throw new ApiError(404, "Cliente não encontrado para atualização.");
  }

  res.status(200).json({
    message: "Cliente atualizado com sucesso!",
    client: updatedClient,
  });
});

// @desc    Deletar um cliente
// @access  Private (Admin)
exports.deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  const deletedRowCount = await clientRepository.deleteClient(id, tenantId);

  if (deletedRowCount === 0) {
    throw new ApiError(404, "Cliente não encontrado para deleção.");
  }

  res.status(200).json({ message: "Cliente deletado com sucesso." });
});

// @desc    Obter dados para o dashboard de clientes
// @access  Private (Admin)
exports.getClientDashboard = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const dashboardData = await clientRepository.getClientDashboardData(tenantId);
  res.status(200).json(dashboardData);
});

// @desc    Listar clientes aniversariantes
// @route   GET /api/clients/birthdays
// @access  Private (Admin)
exports.getBirthdayClients = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const currentMonth = new Date().getMonth() + 1; // getMonth() retorna de 0 a 11
  const birthdayClients = await clientRepository.findByBirthMonth(currentMonth, tenantId);
  res.status(200).json(birthdayClients);
});

// @desc    Enviar mensagem de WhatsApp para um cliente
// @route   POST /api/clients/:id/send-message
// @access  Private (Admin)
exports.sendMessageToClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const { tenantId } = req.user;

  const client = await clientRepository.getClientById(id, tenantId);

  if (!client) {
    throw new ApiError(404, "Cliente não encontrado.");
  }

  if (!client.phone) {
    throw new ApiError(400, "Este cliente não possui um número de telefone cadastrado.");
  }

  await whatsappService.sendTenantMessage(tenantId, client.phone, message);

  res.status(200).json({ message: "Mensagem enviada com sucesso!" });
});
