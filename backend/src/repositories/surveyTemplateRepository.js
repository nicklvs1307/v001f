const {
  SurveyTemplate,
  Pesquisa,
  Pergunta,
  Tenant,
  Resposta,
} = require("../../models");
const { Op } = require("sequelize");
const { sequelize } = require("../database");
const ApiError = require("../errors/ApiError");

const surveyTemplateRepository = {
  createTemplate: async (templateData, requestingUser) => {
    const { name, description, questions, isSystemTemplate } = templateData;

    // Apenas Super Admins podem criar templates de sistema
    if (isSystemTemplate && requestingUser.role !== "Super Admin") {
      throw new ApiError(
        403,
        "Você não tem permissão para criar um template de sistema.",
      );
    }

    const newTemplate = await SurveyTemplate.create({
      tenantId: isSystemTemplate ? null : requestingUser.tenantId,
      title: name,
      description,
      templateData: questions, // O campo no modelo é 'templateData'
      isSystemTemplate: isSystemTemplate || false,
      createdBy: requestingUser.userId,
    });

    return newTemplate;
  },

  updateTemplate: async (id, templateData, requestingUser) => {
    const template = await SurveyTemplate.findByPk(id);
    if (!template) {
      throw new ApiError(404, "Template de pesquisa não encontrado.");
    }

    // Apenas Super Admins podem editar templates de sistema
    if (template.isSystemTemplate && requestingUser.role !== "Super Admin") {
      throw new ApiError(
        403,
        "Você não tem permissão para editar um template de sistema.",
      );
    }

    // Admins só podem editar templates do seu próprio tenant
    if (
      !template.isSystemTemplate &&
      template.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(
        403,
        "Você não tem permissão para editar este template.",
      );
    }

    const { name, description, questions } = templateData;
    await template.update({
      title: name,
      description,
      templateData: questions,
    });

    return template;
  },

  deleteTemplate: async (id, requestingUser) => {
    const template = await SurveyTemplate.findByPk(id);
    if (!template) {
      throw new ApiError(404, "Template de pesquisa não encontrado.");
    }

    // Apenas Super Admins podem deletar templates de sistema
    if (template.isSystemTemplate && requestingUser.role !== "Super Admin") {
      throw new ApiError(
        403,
        "Você não tem permissão para deletar um template de sistema.",
      );
    }

    // Admins só podem deletar templates do seu próprio tenant
    if (
      !template.isSystemTemplate &&
      template.tenantId !== requestingUser.tenantId
    ) {
      throw new ApiError(
        403,
        "Você não tem permissão para deletar este template.",
      );
    }

    await template.destroy();
    return { message: "Template deletado com sucesso." };
  },

  // Retorna todos os templates (globais e do tenant)
  getAllTemplates: async (tenantId = null) => {
    const whereClause = {
      [Op.or]: [
        { isSystemTemplate: true }, // Templates do sistema
        { tenantId: tenantId }, // Templates do próprio tenant
      ],
    };
    // Se for Super Admin, ele vê todos os templates (globais e de todos os tenants)
    if (tenantId === null) {
      delete whereClause[Op.or]; // Remove a condição para ver todos
    }

    return SurveyTemplate.findAll({
      where: whereClause,
      include: [{ model: Tenant, as: "tenant", attributes: ["name"] }],
      order: [["title", "ASC"]],
    });
  },

  // Retorna um template específico por ID
  getTemplateById: async (id) => {
    return SurveyTemplate.findByPk(id, {
      include: [{ model: Tenant, as: "tenant", attributes: ["name"] }],
    });
  },

  // Cria uma nova pesquisa a partir de um template
  createSurveyFromTemplate: async (
    templateId,
    newSurveyData,
    requestingUser,
  ) => {
    const transaction = await sequelize.transaction();
    try {
      const template = await SurveyTemplate.findByPk(templateId, {
        transaction,
      });
      if (!template) {
        throw new ApiError(404, "Template de pesquisa não encontrado.");
      }

      // Verificar permissão para usar o template (se não for do sistema e não for do tenant do usuário)
      if (
        !template.isSystemTemplate &&
        template.tenantId !== requestingUser.tenantId
      ) {
        throw new ApiError(
          403,
          "Você não tem permissão para usar este template.",
        );
      }

      const {
        title,
        description,
        atendenteId,
        isOpen,
        startDate,
        endDate,
        status,
        expectedRespondents,
        askForAttendant,
        dueDate,
      } = newSurveyData;

      const newSurvey = await Pesquisa.create(
        {
          tenantId: requestingUser.tenantId,
          creatorId: requestingUser.userId,
          title: title || template.title,
          description: description || template.description,
          atendenteId: atendenteId || null,
          isOpen: isOpen !== undefined ? isOpen : false,
          startDate: startDate || null,
          endDate: endDate || null,
          status: status || "draft",
          expectedRespondents: expectedRespondents || 0,
          askForAttendant:
            askForAttendant !== undefined ? askForAttendant : false,
          dueDate: dueDate || null,
        },
        { transaction },
      );

      // Criar perguntas baseadas no templateData
      const questionsToCreate = template.templateData.map((q) => ({
        pesquisaId: newSurvey.id,
        type: q.type,
        text: q.text,
        options: q.options || [],
        order: q.order,
        required: q.required || false,
        criterioId: q.criterioId || null,
      }));

      await Pergunta.bulkCreate(questionsToCreate, { transaction });

      await transaction.commit();
      return newSurvey;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Sobrescreve uma pesquisa existente com um template
  overwriteSurveyWithTemplate: async (surveyId, templateId, requestingUser) => {
    const transaction = await sequelize.transaction();
    try {
      const survey = await Pesquisa.findByPk(surveyId, { transaction });
      if (!survey) {
        throw new ApiError(404, "Pesquisa existente não encontrada.");
      }

      // Verificar se o usuário tem permissão para sobrescrever esta pesquisa
      if (
        requestingUser.role !== "Super Admin" &&
        survey.tenantId !== requestingUser.tenantId
      ) {
        throw new ApiError(
          403,
          "Você não tem permissão para sobrescrever esta pesquisa.",
        );
      }

      const template = await SurveyTemplate.findByPk(templateId, {
        transaction,
      });
      if (!template) {
        throw new ApiError(404, "Template de pesquisa não encontrado.");
      }

      // Verificar permissão para usar o template
      if (
        !template.isSystemTemplate &&
        template.tenantId !== requestingUser.tenantId
      ) {
        throw new ApiError(
          403,
          "Você não tem permissão para usar este template.",
        );
      }

      // 1. Deletar perguntas e respostas existentes da pesquisa
      await Resposta.destroy({ where: { pesquisaId: surveyId }, transaction });
      await Pergunta.destroy({ where: { pesquisaId: surveyId }, transaction });

      // 2. Atualizar dados da pesquisa com os do template
      await survey.update(
        {
          title: template.title,
          description: template.description,
          startDate: template.startDate || null,
          endDate: template.endDate || null,
          status: template.status || "draft",
          expectedRespondents: template.expectedRespondents || 0,
          askForAttendant:
            template.askForAttendant !== undefined
              ? template.askForAttendant
              : false,
          dueDate: template.dueDate || null,
        },
        { transaction },
      );

      // 3. Criar novas perguntas baseadas no templateData
      const questionsToCreate = template.templateData.map((q) => ({
        pesquisaId: survey.id,
        type: q.type,
        text: q.text,
        options: q.options || [],
        order: q.order,
        required: q.required || false,
        criterioId: q.criterioId || null,
      }));

      await Pergunta.bulkCreate(questionsToCreate, { transaction });

      await transaction.commit();
      return survey;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

module.exports = surveyTemplateRepository;
