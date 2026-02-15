const asyncHandler = require("express-async-handler");
const surveyService = require("../services/surveyService");
const surveyRepository = require("../repositories/surveyRepository");
const ApiError = require("../errors/ApiError");
const qrcode = require("qrcode");

exports.createSurvey = asyncHandler(async (req, res) => {
  const survey = await surveyService.createSurvey(req.body, req.user);
  res.status(201).json({
    message: "Pesquisa criada com sucesso!",
    survey,
  });
});

exports.getSurveysList = asyncHandler(async (req, res) => {
  const tenantId = req.user.role.name === "Super Admin" ? null : req.user.tenantId;
  const { status } = req.query;
  const surveys = await surveyService.getSurveysList(tenantId, status);
  res.status(200).json(surveys);
});

exports.getSurveyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const survey = await surveyService.getSurveyById(id, req.user);
  res.status(200).json(survey);
});

exports.updateSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedSurvey = await surveyService.updateSurvey(
    id,
    req.body,
    req.user,
  );

  if (!updatedSurvey) {
    throw new ApiError(404, "Pesquisa não encontrada para atualização.");
  }

  res.status(200).json(updatedSurvey);
});

exports.deleteSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await surveyService.deleteSurvey(id, req.user);
  res.status(200).json({ message: "Pesquisa deletada com sucesso." });
});

exports.getSurveyStats = asyncHandler(async (req, res) => {
  const stats = await surveyService.getSurveyStats(req.user);
  res.status(200).json(stats);
});

exports.getSurveyResults = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;
  const tenantId =
    requestingUser.role.name === "Super Admin" ? null : requestingUser.tenantId;

  const results = await surveyService.getSurveyResultsById(id, tenantId);

  if (!results) {
    throw new ApiError(404, "Resultados da pesquisa não encontrados.");
  }

  if (
    requestingUser.role.name !== "Super Admin" &&
    results.surveyTenantId !== requestingUser.tenantId
  ) {
    throw new ApiError(
      403,
      "Você não tem permissão para ver os resultados desta pesquisa.",
    );
  }

  res.status(200).json(results);
});

exports.generateSurveyQrCode = asyncHandler(async (req, res) => {
  const { url } = req.query;
  if (!url) {
    throw new ApiError(400, "URL é obrigatória para gerar o QR Code.");
  }
  const qrCodeDataUrl = await qrcode.toDataURL(url);
  res.status(200).json({ qrCode: qrCodeDataUrl, publicUrl: url });
});
