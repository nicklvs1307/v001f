const asyncHandler = require("express-async-handler");
const surveyTemplateRepository = require("../repositories/surveyTemplateRepository");
const ApiError = require("../errors/ApiError");

const surveyTemplateController = {
  // @desc    Obter todos os templates de pesquisa (globais e do tenant)
  // @route   GET /api/survey-templates
  // @access  Private (Super Admin, Admin, Survey Creator)
  getAllTemplates: asyncHandler(async (req, res) => {
    const requestingUser = req.user;
    const tenantId =
      requestingUser.role.name === "Super Admin" ? null : requestingUser.tenantId;

    const templates = await surveyTemplateRepository.getAllTemplates(tenantId);
    res.status(200).json(templates);
  }),

  // @desc    Obter um template de pesquisa por ID
  // @route   GET /api/survey-templates/:id
  // @access  Private (Super Admin, Admin, Survey Creator)
  getTemplateById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const template = await surveyTemplateRepository.getTemplateById(id);

    if (!template) {
      throw new ApiError(404, "Template de pesquisa não encontrado.");
    }

    // Verificar se o usuário tem permissão para ver este template
    // Super Admin pode ver todos
    // Admin/Survey Creator só pode ver templates do sistema ou do seu próprio tenant
    const requestingUser = req.user;
    if (
      requestingUser.role.name !== "Super Admin" &&
      !template.isSystemTemplate &&
      template.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(403, "Você não tem permissão para ver este template.");
    }

    res.status(200).json(template);
  }),

  // @desc    Criar um novo template de pesquisa
  // @route   POST /api/survey-templates
  // @access  Private (Super Admin, Admin)
  createTemplate: asyncHandler(async (req, res) => {
    const newTemplate = await surveyTemplateRepository.createTemplate(
      req.body,
      req.user,
    );
    res.status(201).json(newTemplate);
  }),

  // @desc    Atualizar um template de pesquisa
  // @route   PUT /api/survey-templates/:id
  // @access  Private (Super Admin, Admin)
  updateTemplate: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedTemplate = await surveyTemplateRepository.updateTemplate(
      id,
      req.body,
      req.user,
    );
    res.status(200).json(updatedTemplate);
  }),

  // @desc    Deletar um template de pesquisa
  // @route   DELETE /api/survey-templates/:id
  // @access  Private (Super Admin, Admin)
  deleteTemplate: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await surveyTemplateRepository.deleteTemplate(id, req.user);
    res.status(200).json({ message: "Template deletado com sucesso." });
  }),

  // @desc    Criar uma nova pesquisa a partir de um template
  // @route   POST /api/survey-templates/:id/create-survey
  // @access  Private (Super Admin, Admin, Survey Creator)
  createSurveyFromTemplate: asyncHandler(async (req, res) => {
    const { id } = req.params; // ID do template
    const { title, description, atendenteId, isOpen } = req.body; // Dados opcionais para a nova pesquisa
    const requestingUser = req.user;

    const newSurvey = await surveyTemplateRepository.createSurveyFromTemplate(
      id,
      { title, description, atendenteId, isOpen },
      requestingUser,
    );

    res.status(201).json({
      message: "Pesquisa criada a partir do template com sucesso!",
      survey: newSurvey,
    });
  }),

  // @desc    Sobrescrever uma pesquisa existente com um template
  // @route   PUT /api/survey-templates/:templateId/overwrite-survey/:surveyId
  // @access  Private (Super Admin, Admin, Survey Creator)
  overwriteSurveyWithTemplate: asyncHandler(async (req, res) => {
    const { templateId, surveyId } = req.params;
    const requestingUser = req.user;

    const updatedSurvey =
      await surveyTemplateRepository.overwriteSurveyWithTemplate(
        surveyId,
        templateId,
        requestingUser,
      );

    res.status(200).json({
      message: "Pesquisa sobrescrita com sucesso!",
      survey: updatedSurvey,
    });
  }),
};

module.exports = surveyTemplateController;
