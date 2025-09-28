'use strict';
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { Pesquisa } = require('../../models');
const roletaPremioRepository = require('../repositories/roletaPremioRepository');
const cupomRepository = require('../repositories/cupomRepository');
const clientRepository = require('../repositories/clientRepository');
const ApiError = require('../errors/ApiError');

// @desc    Girar a roleta e conceder um prêmio
// @route   POST /api/roleta/spin
// @access  Public (para clientes recém-cadastrados)
exports.spinRoleta = asyncHandler(async (req, res) => {
  const { pesquisaId, clientId } = req.params;

  if (!clientId || !pesquisaId) {
    throw new ApiError(400, 'ID do cliente e da pesquisa são obrigatórios.');
  }

  const pesquisa = await Pesquisa.findByPk(pesquisaId);
  if (!pesquisa || !pesquisa.roletaId) {
    throw new ApiError(404, 'Roleta não configurada para esta pesquisa.');
  }

  const cliente = await clientRepository.getClientById(clientId);
  if (!cliente) {
    throw new ApiError(404, 'Cliente não encontrado.');
  }

  // Verificar se o cliente já girou a roleta para esta pesquisa recentemente
  const latestCupom = await cupomRepository.findByClientAndSurvey(clientId, pesquisaId);
  if (latestCupom) {
    const now = new Date();
    const lastSpinTime = new Date(latestCupom.dataGeracao);
    const timeDiff = now.getTime() - lastSpinTime.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 24) {
      throw new ApiError(429, 'Você só pode girar a roleta uma vez por dia.');
    }
  }

  const tenantId = pesquisa.tenantId;

  const premios = await roletaPremioRepository.findAll({ tenantId, roletaId: pesquisa.roletaId });

  if (!premios || premios.length === 0) {
    throw new ApiError(404, 'Nenhum prêmio configurado para a roleta desta pesquisa.');
  }

  // Validar probabilidades individuais
  for (const premio of premios) {
    if (typeof premio.probabilidade !== 'number' || premio.probabilidade < 0) {
      throw new ApiError(500, `Prêmio com ID ${premio.id} tem uma probabilidade inválida.`);
    }
  }

  const totalProbabilidade = premios.reduce((sum, premio) => sum + premio.probabilidade, 0);
  if (totalProbabilidade <= 0) {
    throw new ApiError(400, 'A soma das probabilidades dos prêmios deve ser maior que zero.');
  }

  // Usar crypto para um número aleatório mais seguro
  const randomBytes = crypto.randomBytes(4); // 4 bytes para um inteiro de 32 bits
  const randomNumber = randomBytes.readUInt32BE(0) / 0xFFFFFFFF; // Gera um float entre 0 e 1

  const target = randomNumber * totalProbabilidade;

  let cumulativeProbability = 0;
  let premioGanhador = null;

  for (const premio of premios) {
    cumulativeProbability += premio.probabilidade;
    if (target < cumulativeProbability) {
      premioGanhador = premio;
      break;
    }
  }

  // Fallback de segurança (teoricamente não deve ser alcançado)
  if (!premioGanhador) {
    premioGanhador = premios[premios.length - 1];
  }

  const recompensa = premioGanhador.recompensa;
  if (!recompensa || !recompensa.id) {
    throw new ApiError(500, 'Recompensa associada ao prêmio ganhador não encontrada ou inválida.');
  }

  const clienteNome = cliente.name.split(' ')[0];
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const codigoCupom = `${clienteNome.toUpperCase()}${randomDigits}`;

  const dataValidade = new Date();
  dataValidade.setDate(dataValidade.getDate() + 30);

  const cupomData = {
    tenantId: tenantId,
    recompensaId: recompensa.id,
    codigo: codigoCupom,
    clienteId: clientId,
    pesquisaId: pesquisaId, // Adicionar o ID da pesquisa
    dataValidade: dataValidade,
    dataGeracao: new Date(),
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
  const { pesquisaId, clientId } = req.params;

  if (!pesquisaId || !clientId) {
    throw new ApiError(400, 'ID da pesquisa e do cliente são obrigatórios.');
  }

  const pesquisa = await Pesquisa.findByPk(pesquisaId);
  if (!pesquisa || !pesquisa.roletaId) {
    return res.status(200).json({ items: [], hasSpun: false });
  }

  const latestCupom = await cupomRepository.findByClientAndSurvey(clientId, pesquisaId);
  let hasSpunRecently = false;
  if (latestCupom) {
    const now = new Date();
    const lastSpinTime = new Date(latestCupom.dataGeracao);
    const timeDiff = now.getTime() - lastSpinTime.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    if (hoursDiff < 24) {
      hasSpunRecently = true;
    }
  }

  const premios = await roletaPremioRepository.findAll({ tenantId: pesquisa.tenantId, roletaId: pesquisa.roletaId });

  if (!premios || premios.length === 0) {
    return res.status(200).json({ items: [], hasSpun: hasSpunRecently });
  }

  const items = premios
    .filter(premio => premio.recompensa)
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

  res.status(200).json({ items, hasSpun: hasSpunRecently });
});
