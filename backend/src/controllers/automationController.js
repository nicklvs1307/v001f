const asyncHandler = require("express-async-handler");
const { format, addDays, subDays, subWeeks, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth } = require("date-fns");
const { ptBR } = require("date-fns/locale");
const { formatInTimeZone, TIMEZONE } = require("../utils/dateUtils");
const { zonedTimeToUtc } = require("date-fns-tz");
const whatsappService = require("../services/whatsappService");
const tenantRepository = require("../repositories/tenantRepository");
const dashboardRepository = require("../repositories/dashboardRepository");
const whatsappConfigRepository = require("../repositories/whatsappConfigRepository");
const recompensaRepository = require("../repositories/recompensaRepository");
const roletaRepository = require("../repositories/roletaRepository");
const { WhatsappTemplate } = require("../../models");
const ApiError = require("../errors/ApiError");

// @desc    Enviar um teste de mensagem de relatório diário
// @route   POST /api/automations/test/daily-report
// @access  Admin, Superadmin
exports.testDailyReport = asyncHandler(async (req, res) => {
  const { tenantId, phoneNumber } = req.body;

  if (!tenantId || !phoneNumber) {
    throw new ApiError(400, "tenantId e phoneNumber são obrigatórios.");
  }

  const tenant = await tenantRepository.getTenantById(tenantId);
  if (!tenant) {
    throw new ApiError(404, "Tenant não encontrado.");
  }

  // Correct timezone-aware date calculation
  const today = new Date();

  // Yesterday
  const yesterday = subDays(today, 1);
  const yesterdayDateString = formatInTimeZone(yesterday, "yyyy-MM-dd");
  const startOfYesterdayZoned = zonedTimeToUtc(
    `${yesterdayDateString} 00:00:00`,
    TIMEZONE,
  );
  const endOfYesterdayZoned = zonedTimeToUtc(
    `${yesterdayDateString} 23:59:59.999`,
    TIMEZONE,
  );

  // Two days ago
  const twoDaysAgo = subDays(today, 2);
  const twoDaysAgoDateString = formatInTimeZone(twoDaysAgo, "yyyy-MM-dd");
  const startOfTwoDaysAgoZoned = zonedTimeToUtc(
    `${twoDaysAgoDateString} 00:00:00`,
    TIMEZONE,
  );
  const endOfTwoDaysAgoZoned = zonedTimeToUtc(
    `${twoDaysAgoDateString} 23:59:59.999`,
    TIMEZONE,
  );

  const yesterdaySummary = await dashboardRepository.getSummary(
    tenantId,
    startOfYesterdayZoned,
    endOfYesterdayZoned,
  );
  const twoDaysAgoSummary = await dashboardRepository.getSummary(
    tenantId,
    startOfTwoDaysAgoZoned,
    endOfTwoDaysAgoZoned,
  );

  const diff =
    yesterdaySummary.totalResponses - twoDaysAgoSummary.totalResponses;
  const diffArrow = diff > 0 ? "⬆" : diff < 0 ? "⬇" : "➖";
  const diffText = `(${diffArrow} ${diff} respostas em relação a ${format(twoDaysAgo, "dd/MM/yyyy")})`;

  const formattedDate = format(yesterday, "dd/MM/yyyy");
  const isoDate = format(yesterday, "yyyy-MM-dd");
  const baseUrl = process.env.FRONTEND_URL || "https://loyalfood.towersfy.com";
  const reportUrl = `${baseUrl}/relatorios/diario?date=${isoDate}`;

  let message =
    `*Relatorio Diario ${tenant.name}*\n\n` +
    `Aqui está o resumo da experiência dos seus clientes no dia ${formattedDate}!\n` +
    `📊 Total de respostas: ${yesterdaySummary.totalResponses} ${diffText}\n` +
    `🟢 Número de Promotores: ${yesterdaySummary.nps.promoters}\n` +
    `🟡 Número de Neutros: ${yesterdaySummary.nps.neutrals}\n` +
    `🔴 Número de Detratores: ${yesterdaySummary.nps.detractors}\n\n` +
    `🔗 Para acessar o sistema, visite ${reportUrl}`;

  message += "\n\n--- MENSAGEM DE TESTE ---";

  await whatsappService.sendTenantMessage(tenantId, phoneNumber, message);

  res.status(200).json({
    message: `Mensagem de teste de relatório diário enviada para ${phoneNumber}.`,
  });
});

// @desc    Enviar um teste de mensagem de aniversário
// @route   POST /api/automations/test/birthday
// @access  Admin, Superadmin
exports.testBirthday = asyncHandler(async (req, res) => {
  const { tenantId, phoneNumber } = req.body;

  if (!tenantId || !phoneNumber) {
    throw new ApiError(400, "tenantId e phoneNumber são obrigatórios.");
  }

  const whatsappConfig = await whatsappConfigRepository.findByTenant(tenantId);
  if (!whatsappConfig || !whatsappConfig.birthdayAutomationEnabled) {
    throw new ApiError(
      400,
      "A automação de aniversário não está habilitada para este tenant.",
    );
  }

  if (!whatsappConfig.birthdayRewardId || !whatsappConfig.birthdayRewardType) {
    throw new ApiError(
      400,
      "A recompensa de aniversário (tipo e ID) não está configurada.",
    );
  }

  let rewardName = "";
  if (whatsappConfig.birthdayRewardType === "recompensa") {
    const recompensa = await recompensaRepository.findById(
      whatsappConfig.birthdayRewardId,
    );
    if (recompensa) rewardName = recompensa.name;
  } else if (whatsappConfig.birthdayRewardType === "roleta") {
    const roleta = await roletaRepository.findById(
      whatsappConfig.birthdayRewardId,
    );
    if (roleta) rewardName = roleta.name;
  }

  if (!rewardName) {
    throw new ApiError(
      404,
      "A recompensa de aniversário configurada não foi encontrada.",
    );
  }

  const clientName = "Cliente de Teste";
  const cupomCode = "NIVER123";

  let message = whatsappConfig.birthdayMessageTemplate;
  message = message.replace(/{{cliente}}/g, clientName);
  message = message.replace(/{{recompensa}}/g, rewardName);
  message = message.replace(/{{cupom}}/g, cupomCode);

  message += "\n\n--- MENSAGEM DE TESTE ---";

  await whatsappService.sendTenantMessage(tenantId, phoneNumber, message);

  res.status(200).json({
    message: `Mensagem de teste de aniversário enviada para ${phoneNumber}.`,
  });
});

// @desc    Enviar um teste de mensagem de lembrete de cupom
// @route   POST /api/automations/test/coupon-reminder
// @access  Admin, Superadmin
exports.testCouponReminder = asyncHandler(async (req, res) => {
  const { tenantId, phoneNumber } = req.body;

  if (!tenantId || !phoneNumber) {
    throw new ApiError(400, "tenantId e phoneNumber são obrigatórios.");
  }

  const couponReminderTemplate = await WhatsappTemplate.findOne({
    where: { tenantId, type: "COUPON_REMINDER" },
  });

  if (!couponReminderTemplate || !couponReminderTemplate.isEnabled) {
    throw new ApiError(
      400,
      "A automação de lembrete de cupom não está habilitada para este tenant.",
    );
  }

  const clientName = "Cliente de Teste";
  const cupomCode = "EXPIRA123";
  const rewardName = "Prêmio de Teste";
  const expirationDate = format(
    addDays(now(), couponReminderTemplate.daysBefore || 3),
    "dd/MM/yyyy",
  );

  let message = couponReminderTemplate.message;
  message = message.replace(/{{cliente}}/g, clientName);
  message = message.replace(/{{cupom}}/g, cupomCode);
  message = message.replace(/{{recompensa}}/g, rewardName);
  message = message.replace(/{{data_validade}}/g, expirationDate);

  message += "\n\n--- MENSAGEM DE TESTE ---";

  await whatsappService.sendTenantMessage(tenantId, phoneNumber, message);

  res.status(200).json({
    message: `Mensagem de teste de lembrete de cupom enviada para ${phoneNumber}.`,
  });
});

// @desc    Enviar um teste de mensagem de prêmio da roleta
// @route   POST /api/automations/test/roleta-prize
// @access  Admin, Superadmin
exports.testRoletaPrize = asyncHandler(async (req, res) => {
  const { tenantId, phoneNumber } = req.body;

  if (!tenantId || !phoneNumber) {
    throw new ApiError(400, "tenantId e phoneNumber são obrigatórios.");
  }

  const whatsappConfig = await whatsappConfigRepository.findByTenant(tenantId);
  if (!whatsappConfig || !whatsappConfig.sendPrizeMessage) {
    throw new ApiError(
      400,
      "O envio de mensagem de prêmio da roleta não está habilitado para este tenant.",
    );
  }

  const clientName = "Cliente de Teste";
  const prizeName = "Prêmio de Teste da Roleta";
  const cupomCode = "ROLETA123";

  let message = whatsappConfig.prizeMessageTemplate;
  message = message.replace(/{{cliente}}/g, clientName);
  message = message.replace(/{{premio}}/g, prizeName);
  message = message.replace(/{{cupom}}/g, cupomCode);

  message += "\n\n--- MENSAGEM DE TESTE ---";

  await whatsappService.sendTenantMessage(tenantId, phoneNumber, message);

  res.status(200).json({
    message: `Mensagem de teste de prêmio da roleta enviada para ${phoneNumber}.`,
  });
});

// @desc    Enviar um teste de mensagem de relatório semanal
// @route   POST /api/automations/test/weekly-report
// @access  Admin, Superadmin
exports.testWeeklyReport = asyncHandler(async (req, res) => {
  const { tenantId, phoneNumber } = req.body;

  if (!tenantId || !phoneNumber) {
    throw new ApiError(400, "tenantId e phoneNumber são obrigatórios.");
  }

  const tenant = await tenantRepository.getTenantById(tenantId);
  if (!tenant) {
    throw new ApiError(404, "Tenant não encontrado.");
  }

  const zonedNow = now();
  const lastWeek = subWeeks(zonedNow, 1);
  const startOfLastWeek = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Monday
  const endOfLastWeek = endOfWeek(lastWeek, { weekStartsOn: 1 });   // Sunday

  const weeklySummary = await dashboardRepository.getSummary(
    tenantId,
    startOfLastWeek,
    endOfLastWeek,
  );

  const formattedStartDate = format(startOfLastWeek, "dd/MM/yyyy");
  const formattedEndDate = format(endOfLastWeek, "dd/MM/yyyy");
  const isoDate = format(endOfLastWeek, "yyyy-MM-dd");
  
  const baseUrl =
    process.env.FRONTEND_URL || "https://loyalfood.towersfy.com";
  const reportUrl = `${baseUrl}/relatorios/semanal?date=${isoDate}`;

  let message =
    `*Relatório Semanal ${tenant.name}*\n\n` +
    `Aqui está o resumo da experiência dos seus clientes na semana de ${formattedStartDate} a ${formattedEndDate}!\n` +
    `📊 Total de respostas: ${weeklySummary.totalResponses}\n` +
    `🟢 Número de Promotores: ${weeklySummary.nps.promoters}\n` +
    `🟡 Número de Neutros: ${weeklySummary.nps.neutrals}\n` +
    `🔴 Número de Detratores: ${weeklySummary.nps.detractors}\n\n` +
    `🔗 Para acessar o relatório completo, visite ${reportUrl}`;
    
  message += "\n\n--- MENSAGEM DE TESTE ---";

  await whatsappService.sendTenantMessage(tenantId, phoneNumber, message);

  res.status(200).json({
    message: `Mensagem de teste de relatório semanal enviada para ${phoneNumber}.`,
  });
});

// @desc    Enviar um teste de mensagem de relatório mensal
// @route   POST /api/automations/test/monthly-report
// @access  Admin, Superadmin
exports.testMonthlyReport = asyncHandler(async (req, res) => {
  const { tenantId, phoneNumber } = req.body;

  if (!tenantId || !phoneNumber) {
    throw new ApiError(400, "tenantId e phoneNumber são obrigatórios.");
  }

  const tenant = await tenantRepository.getTenantById(tenantId);
  if (!tenant) {
    throw new ApiError(404, "Tenant não encontrado.");
  }

  const zonedNow = now();
  const lastMonth = subMonths(zonedNow, 1);
  const startOfLastMonth = startOfMonth(lastMonth);
  const endOfLastMonth = endOfMonth(lastMonth);

  const monthlySummary = await dashboardRepository.getSummary(
    tenantId,
    startOfLastMonth,
    endOfLastMonth,
  );

  const formattedMonth = format(lastMonth, "MMMM 'de' yyyy", { locale: ptBR });
  const isoDate = format(endOfLastMonth, "yyyy-M-dd");

  const baseUrl =
    process.env.FRONTEND_URL || "https://loyalfood.towersfy.com";
  const reportUrl = `${baseUrl}/relatorios/mensal?date=${isoDate}`;

  let message =
    `*Relatório Mensal ${tenant.name}*\n\n` +
    `Aqui está o resumo da experiência dos seus clientes em ${formattedMonth}!\n` +
    `📊 Total de respostas: ${monthlySummary.totalResponses}\n` +
    `🟢 Número de Promotores: ${monthlySummary.nps.promoters}\n` +
    `🟡 Número de Neutros: ${monthlySummary.nps.neutrals}\n` +
    `🔴 Número de Detratores: ${monthlySummary.nps.detractors}\n\n` +
    `🔗 Para acessar o relatório completo, visite ${reportUrl}`;

  message += "\n\n--- MENSAGEM DE TESTE ---";

  await whatsappService.sendTenantMessage(tenantId, phoneNumber, message);

  res.status(200).json({
    message: `Mensagem de teste de relatório mensal enviada para ${phoneNumber}.`,
  });
});
