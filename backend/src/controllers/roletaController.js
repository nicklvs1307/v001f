"use strict";
const { now } = require("../utils/dateUtils");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const { Pesquisa } = require("../../models");
const roletaPremioRepository = require("../repositories/roletaPremioRepository");
const cupomRepository = require("../repositories/cupomRepository");
const clientRepository = require("../repositories/clientRepository");
const ApiError = require("../errors/ApiError");
const { WhatsappConfig } = require("../../models");
const whatsappService = require("../services/whatsappService");

// @desc    Girar a roleta e conceder um prêmio
// @route   POST /api/roleta/spin
// @access  Public (para clientes recém-cadastrados)
exports.spinRoleta = asyncHandler(async (req, res) => {
  const { pesquisaId, clientId } = req.params;

  if (!clientId || !pesquisaId) {
    throw new ApiError(400, "ID do cliente e da pesquisa são obrigatórios.");
  }

  const pesquisa = await Pesquisa.findByPk(pesquisaId);
  if (!pesquisa || !pesquisa.roletaId) {
    throw new ApiError(404, "Roleta não configurada para esta pesquisa.");
  }

  const cliente = await clientRepository.getClientById(clientId);
  if (!cliente) {
    throw new ApiError(404, "Cliente não encontrado.");
  }

  // Verificar se o cliente já girou a roleta para esta pesquisa recentemente
  const latestCupom = await cupomRepository.findByClientAndSurvey(
    clientId,
    pesquisaId,
  );
  if (latestCupom) {
    const currentTime = now();
    const lastSpinTime = new Date(latestCupom.dataGeracao);
    const timeDiff = currentTime.getTime() - lastSpinTime.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 24) {
      throw new ApiError(429, "Você já girou a roleta recentemente. Tente novamente no seu próximo pedido ou visita.");
    }
  }

  const tenantId = pesquisa.tenantId;

  const premios = await roletaPremioRepository.findAll({
    tenantId,
    roletaId: pesquisa.roletaId,
  });

  if (!premios || premios.length === 0) {
    throw new ApiError(
      404,
      "Nenhum prêmio configurado para a roleta desta pesquisa.",
    );
  }

  // Validar probabilidades individuais
  for (const premio of premios) {
    if (typeof premio.porcentagem !== "number" || premio.porcentagem < 0) {
      throw new ApiError(
        500,
        `Prêmio com ID ${premio.id} tem uma probabilidade inválida.`,
      );
    }
  }

  const totalProbabilidade = premios.reduce(
    (sum, premio) => sum + premio.porcentagem,
    0,
  );
  if (totalProbabilidade <= 0) {
    throw new ApiError(
      400,
      "A soma das probabilidades dos prêmios deve ser maior que zero.",
    );
  }

  // Usar crypto para um número aleatório mais seguro
  const randomBytes = crypto.randomBytes(4); // 4 bytes para um inteiro de 32 bits
  const randomNumber = randomBytes.readUInt32BE(0) / 0xffffffff; // Gera um float entre 0 e 1

  const target = randomNumber * totalProbabilidade;

  let cumulativeProbability = 0;
  let premioGanhador = null;

  for (const premio of premios) {
    cumulativeProbability += premio.porcentagem;
    if (target < cumulativeProbability) {
      premioGanhador = premio;
      break;
    }
  }

  // Fallback de segurança (teoricamente não deve ser alcançado)
  if (!premioGanhador) {
    premioGanhador = premios[premios.length - 1];
  }

  // --- MODIFICAÇÃO: Lidar com a opção "Não foi dessa vez" ---
  if (premioGanhador.isNoPrizeOption) {
    return res.status(200).json({
      message: "Não foi dessa vez! Tente novamente no seu próximo pedido ou visita.",
      premio: {
        id: premioGanhador.id,
        nome: premioGanhador.nome,
        descricao: premioGanhador.descricao,
        isNoPrizeOption: true,
      },
      cupom: null, // Nenhum cupom gerado para esta opção
    });
  }

  const recompensa = premioGanhador.recompensa;
  // A validação abaixo agora é executada APENAS se não for isNoPrizeOption
  if (!recompensa || !recompensa.id) {
    throw new ApiError(
      500,
      "Recompensa associada ao prêmio ganhador não encontrada ou inválida.",
    );
  }

  const clienteNome = cliente.name.split(" ")[0];
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const codigoCupom = `${clienteNome.toUpperCase()}${randomDigits}`;

  const dataValidade = now();
  dataValidade.setDate(dataValidade.getDate() + 30);

  const cupomData = {
    tenantId: tenantId,
    recompensaId: recompensa.id,
    codigo: codigoCupom,
    clienteId: clientId,
    pesquisaId: pesquisaId, // Adicionar o ID da pesquisa
    dataValidade: dataValidade,
    dataGeracao: new Date(),
    status: "active",
  };

  const novoCupom = await cupomRepository.create(cupomData);

  // Envio da mensagem de prêmio em segundo plano
  (async () => {
    try {
      console.log(
        `[RoletaController] Iniciando envio de mensagem de prêmio para o tenant ${tenantId}.`,
      );
      const whatsappConfig = await WhatsappConfig.findOne({
        where: { tenantId },
      });

      console.log(
        `[RoletaController] Config do WhatsApp para o tenant ${tenantId}:`,
        whatsappConfig ? whatsappConfig.toJSON() : "Não encontrada",
      );

      if (
        whatsappConfig &&
        whatsappConfig.sendPrizeMessage &&
        cliente &&
        cliente.phone
      ) {
        console.log(
          `[RoletaController] Todas as condições para enviar a mensagem de prêmio foram atendidas para o tenant ${tenantId}.`,
        );

        console.log(`[RoletaController] Preparando mensagem para ${cliente.name}. Recompensa:`, {
          name: recompensa.name,
          hasCondition: !!recompensa.conditionDescription,
          conditionLength: recompensa.conditionDescription?.length
        });

        const regrasTexto = recompensa.conditionDescription
          ? recompensa.conditionDescription
              .split('\n')
              .filter(linha => linha.trim() !== '')
              .map(linha => `🔸 ${linha.trim()}`)
              .join('\n')
          : "🔸 Sem regras específicas.";

        let message =
          pesquisa.roletaPrizeMessage ||
          whatsappConfig.prizeMessageTemplate ||
          "Parabéns, {{cliente}}! Você ganhou um prêmio: {{premio}}. Use o cupom {{cupom}} para resgatar.\n\n*Regras de uso:*\n{{regras}}";
        
        message = message.replace(/{{\s*cliente\s*}}/gi, cliente.name.split(" ")[0]);
        message = message.replace(/{{\s*premio\s*}}/gi, recompensa.name);
        message = message.replace(/{{\s*cupom\s*}}/gi, novoCupom.codigo);
        message = message.replace(/{{\s*regras\s*}}/gi, regrasTexto);

        console.log(`[RoletaController] Mensagem final formatada: ${message}`);

        await whatsappService.sendTenantMessage(
          tenantId,
          cliente.phone,
          message,
        );

        console.log(
          `[RoletaController] Mensagem de prêmio enviada com sucesso para ${cliente.phone} no tenant ${tenantId}.`,
        );
      } else {
        console.log(
          `[RoletaController] As condições para enviar a mensagem de prêmio não foram atendidas para o tenant ${tenantId}.`,
        );
        console.log(
          `[RoletaController] Detalhes: sendPrizeMessage=${whatsappConfig?.sendPrizeMessage}, instanceStatus=${whatsappConfig?.instanceStatus}, cliente.phone=${cliente?.phone}`,
        );
      }
    } catch (error) {
      console.error(
        `[RoletaController] Falha ao tentar enviar mensagem de prêmio via WhatsApp para o tenant ${tenantId}. Erro:`,
        error.message,
      );
    }
  })();

  res.status(200).json({
    message: "Parabéns! Você ganhou um prêmio!",
    premio: {
      id: premioGanhador.id,
      nome: premioGanhador.nome,
      descricao: premioGanhador.descricao,
      recompensa: {
        name: recompensa.name,
        value: recompensa.value,
        type: recompensa.type,
        conditionDescription: recompensa.conditionDescription,
      },
      isNoPrizeOption: false, // Explicitamente false para prêmios reais
    },
    cupom: {
      id: novoCupom.id,
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
    throw new ApiError(400, "ID da pesquisa e do cliente são obrigatórios.");
  }

  const pesquisa = await Pesquisa.findByPk(pesquisaId);
  if (!pesquisa || !pesquisa.roletaId) {
    return res.status(200).json({ items: [], hasSpun: false });
  }

  const latestCupom = await cupomRepository.findByClientAndSurvey(
    clientId,
    pesquisaId,
  );
  let hasSpunRecently = false;
  if (latestCupom) {
    const currentTime = now();
    const lastSpinTime = new Date(latestCupom.dataGeracao);
    const timeDiff = currentTime.getTime() - lastSpinTime.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    if (hoursDiff < 24) {
      hasSpunRecently = true;
    }
  }

  const premios = await roletaPremioRepository.findAll({
    tenantId: pesquisa.tenantId,
    roletaId: pesquisa.roletaId,
  });

  if (!premios || premios.length === 0) {
    return res.status(200).json({ items: [], hasSpun: hasSpunRecently });
  }

  const items = premios.map((premio) => ({
    id: premio.id,
    name: premio.nome,
    description: premio.descricao,
    probabilidade: premio.porcentagem,
    recompensa: premio.recompensa
      ? {
          id: premio.recompensa.id,
          name: premio.recompensa.name,
          value: premio.recompensa.value,
          type: premio.recompensa.type,
        }
      : null, // Retorna null se não houver recompensa
    isNoPrizeOption: premio.isNoPrizeOption, // Adicionado
  }));

  res.status(200).json({ items, hasSpun: hasSpunRecently });
});
