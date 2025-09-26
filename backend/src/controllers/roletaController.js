'use strict';
const asyncHandler = require('express-async-handler');
const roletaPremioRepository = require('../repositories/roletaPremioRepository');
const cupomRepository = require('../repositories/cupomRepository');
const clientRepository = require('../repositories/clientRepository');
const ApiError = require('../errors/ApiError');
const { v4: uuidv4 } = require('uuid');

// @desc    Girar a roleta e conceder um prêmio
// @route   POST /api/roleta/spin
// @access  Public (para clientes recém-cadastrados)
exports.spinRoleta = asyncHandler(async (req, res) => {
  const { clientId } = req.body; // O ID do cliente que girou a roleta

  if (!clientId) {
    throw new ApiError(400, 'ID do cliente é obrigatório para girar a roleta.');
  }

  // TODO: Implementar lógica para garantir que o cliente só pode girar a roleta uma vez
  // Isso pode ser feito verificando se o cliente já possui um cupom de roleta ou um flag no modelo Cliente.

  // 1. Obter todos os prêmios da roleta para o tenant do cliente
  // Assumindo que o cliente está vinculado a um tenant e que os prêmios são por tenant
  // Para este MVP, vamos assumir que o clienteId já tem o tenantId associado ou que o tenantId virá do req.body/params
  // Por enquanto, vamos buscar todos os prêmios e filtrar pelo tenantId do cliente
  // Em um cenário real, o clienteId viria do token de autenticação do cliente, que conteria o tenantId

  // Para fins de teste, vamos buscar um tenantId de um cliente existente
  // TODO: Refatorar para obter o tenantId do cliente de forma segura (ex: do token JWT do cliente)
  const cliente = await clientRepository.getClientById(clientId);
  if (!cliente || !cliente.tenantId) {
    throw new ApiError(404, 'Cliente não encontrado ou sem tenant associado.');
  }
  const tenantId = cliente.tenantId;

  const premios = await roletaPremioRepository.findAllByTenant(tenantId);

  if (!premios || premios.length === 0) {
    throw new ApiError(404, 'Nenhum prêmio configurado para a roleta deste restaurante.');
  }

  // 2. Calcular a soma total das probabilidades
  const totalProbabilidade = premios.reduce((sum, premio) => sum + premio.probabilidade, 0);

  if (totalProbabilidade <= 0) {
    throw new ApiError(400, 'A soma das probabilidades dos prêmios deve ser maior que zero.');
  }

  // 3. Selecionar um prêmio com base na probabilidade
  let randomNumber = Math.random() * totalProbabilidade;
  let premioGanhador = null;

  for (const premio of premios) {
    if (randomNumber < premio.probabilidade) {
      premioGanhador = premio;
      break;
    }
    randomNumber -= premio.probabilidade;
  }

  // Se por algum motivo não selecionou (ex: erro de arredondamento), pega o último
  if (!premioGanhador) {
    premioGanhador = premios[premios.length - 1];
  }

  // 4. Gerar o cupom para o cliente
  const recompensa = premioGanhador.recompensa; // A recompensa já vem incluída no premioGanhador

  if (!recompensa || !recompensa.id) {
    throw new ApiError(500, 'Recompensa associada ao prêmio ganhador não encontrada ou inválida.');
  }

  // Gerar código do cupom: primeiro nome do cliente + 4 dígitos aleatórios
  const clienteNome = cliente.name.split(' ')[0];
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
  const codigoCupom = `${clienteNome.toUpperCase()}${randomDigits}`;

  // Data de validade: 30 dias a partir de agora
  const dataValidade = new Date();
  dataValidade.setDate(dataValidade.getDate() + 30);

  const cupomData = {
    tenantId: tenantId,
    recompensaId: recompensa.id,
    codigo: codigoCupom,
    clienteId: clientId,
    dataValidade: dataValidade,
    dataGeracao: new Date(), // Adicionado dataGeracao
    status: 'active',
  };

  const novoCupom = await cupomRepository.createCupom(cupomData);

  res.status(200).json({
    message: 'Parabéns! Você ganhou um prêmio!',
    premio: {
      nome: premioGanhador.nome,
      descricao: premioGanhador.descricao,
      recompensa: {
        name: recompensa.name,
        value: recompensa.value,
        type: recompensa.type,
      },
    },
    cupom: {
      codigo: novoCupom.codigo,
      dataValidade: novoCupom.dataValidade,
    },
  });
});

// @desc    Obter configuração da roleta (itens e probabilidades)
// @route   GET /api/roleta/config
// @access  Public (ou protegido, dependendo da necessidade)
exports.getRoletaConfig = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  if (!clientId) {
    throw new ApiError(400, 'ID do cliente é obrigatório para obter a configuração da roleta.');
  }

  const cliente = await clientRepository.getClientById(clientId);
  if (!cliente || !cliente.tenantId) {
    throw new ApiError(404, 'Cliente não encontrado ou sem tenant associado.');
  }
  const tenantId = cliente.tenantId;

  const premios = await roletaPremioRepository.findAllByTenant(tenantId);

  if (!premios || premios.length === 0) {
    return res.status(200).json({ items: [] }); // Retorna array vazio se não houver prêmios
  }

  const items = premios
    .filter(premio => premio.recompensa) // Adiciona um filtro de segurança
    .map(premio => ({
      id: premio.id,
      name: premio.nome,
      description: premio.descricao,
      probabilidade: premio.probabilidade,
      recompensa: {
        id: premio.recompensa.id,
        name: premio.recompensa.name,
        value: premio.recompensa.value,
        type: premio.recompensa.type,
      }
    }));

  res.status(200).json({ items });
});
