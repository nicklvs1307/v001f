const { Pesquisa, Pergunta, Resposta } = require("../../models"); // Importa os modelos do Sequelize
const { convertFromTimeZone } = require("../utils/dateUtils");
const { Op, Sequelize } = require("sequelize");

const getSurveyDetails = async (surveyId, tenantId = null) => {
  const whereClause = tenantId ? { id: surveyId, tenantId } : { id: surveyId };
  return Pesquisa.findByPk(surveyId, {
    where: whereClause,
    attributes: ["id", "title", "description", "tenantId"],
  });
};

const getQuestionsBySurveyId = async (surveyId, tenantId = null) => {
  const whereClause = tenantId
    ? { pesquisaId: surveyId, tenantId }
    : { pesquisaId: surveyId };
  return Pergunta.findAll({
    where: whereClause,
    attributes: ["id", "text", "type", "options"],
    order: [["order", "ASC"]],
  });
};

const getResponsesBySurveyId = async (
  surveyId,
  tenantId = null,
  startDate,
  endDate,
) => {
  const whereClause = tenantId ? { tenantId } : {};

  if (startDate && endDate) {
    whereClause.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  return Resposta.findAll({
    attributes: [
      "perguntaId",
      "respondentSessionId",
      "ratingValue",
      "textValue",
      "selectedOption",
    ],
    where: whereClause,
    include: [
      {
        model: Pergunta,
        as: "pergunta", // Certifique-se de que 'as' corresponde à associação definida no modelo Resposta
        where: { pesquisaId: surveyId },
        attributes: [], // Não precisamos dos atributos da pergunta aqui, apenas para o filtro
        required: true,
      },
    ],
  });
};

const getDailyStats = async (tenantId) => {
  const yesterday = convertFromTimeZone(new Date());
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

  const stats = await Resposta.findAll({
    where: {
      tenantId,
      createdAt: {
        [Op.between]: [startOfYesterday, endOfYesterday],
      },
    },
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: [],
        where: {
          type: "rating_0_10", // Focando apenas em respostas de perguntas NPS para classificação
        },
        required: true,
      },
    ],
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("Resposta.id")), "totalResponses"],
      [
        Sequelize.literal(
          `SUM(CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END)`,
        ),
        "promoters",
      ],
      [
        Sequelize.literal(
          `SUM(CASE WHEN "ratingValue" >= 7 AND "ratingValue" <= 8 THEN 1 ELSE 0 END)`,
        ),
        "neutrals",
      ],
      [
        Sequelize.literal(
          `SUM(CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END)`,
        ),
        "detractors",
      ],
    ],
    raw: true,
  });

  // Como o resultado é um array com um objeto, retornamos o primeiro objeto ou um objeto zerado.
  const result = stats[0];
  return {
    totalResponses: parseInt(result.totalResponses, 10) || 0,
    promoters: parseInt(result.promoters, 10) || 0,
    neutrals: parseInt(result.neutrals, 10) || 0,
    detractors: parseInt(result.detractors, 10) || 0,
  };
};

const getWordCloudDataForSurvey = async (surveyId, tenantId = null) => {
  const whereClause = {
    textValue: { [Op.ne]: null, [Op.ne]: "" },
  };
  if (tenantId) {
    whereClause.tenantId = tenantId;
  }

  const feedbacks = await Resposta.findAll({
    where: whereClause,
    attributes: ["textValue"],
    include: [
      {
        model: Pergunta,
        as: "pergunta",
        attributes: [],
        where: {
          pesquisaId: surveyId,
          type: "free_text",
        },
        required: true,
      },
    ],
  });

  const text = feedbacks.map((f) => f.textValue).join(" ");

  const words = text
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, "")
    .split(/\s+/);

  const stopwords = new Set([
    "de",
    "a",
    "o",
    "que",
    "e",
    "do",
    "da",
    "em",
    "um",
    "para",
    "com",
    "não",
    "uma",
    "os",
    "no",
    "na",
    "por",
    "mais",
    "as",
    "dos",
    "como",
    "mas",
    "foi",
    "ao",
    "ele",
    "das",
    "tem",
    "à",
    "seu",
    "sua",
    "ou",
    "ser",
    "quando",
    "muito",
    "há",
    "nos",
    "já",
    "está",
    "eu",
    "também",
    "só",
    "pelo",
    "pela",
    "até",
    "isso",
    "ela",
    "entre",
    "era",
    "depois",
    "sem",
    "mesmo",
    "aos",
    "ter",
    "seus",
    "quem",
    "nas",
    "me",
    "esse",
    "eles",
    "estão",
    "você",
    "tinha",
    "foram",
    "essa",
    "num",
    "nem",
    "suas",
    "meu",
    "às",
    "minha",
    "numa",
    "pelos",
    "elas",
    "havia",
    "seja",
    "qual",
    "será",
    "nós",
    "tenho",
    "lhe",
    "deles",
    "essas",
    "esses",
    "pelas",
    "este",
    "fosse",
    "dele",
    "tu",
    "te",
    "vocês",
    "vos",
    "lhes",
    "meus",
    "minhas",
    "teu",
    "tua",
    "teus",
    "tuas",
    "nosso",
    "nossa",
    "nossos",
    "nossas",
    "dela",
    "delas",
    "esta",
    "estes",
    "estas",
    "aquele",
    "aquela",
    "aqueles",
    "aquelas",
    "isto",
    "aquilo",
    "estou",
    "está",
    "estamos",
    "estão",
    "estive",
    "esteve",
    "estivemos",
    "estiveram",
    "estava",
    "estávamos",
    "estavam",
    "estivera",
    "estivéramos",
    "esteja",
    "estejamos",
    "estejam",
    "estivesse",
    "estivéssemos",
    "estivessem",
    "estiver",
    "estivermos",
    "estiverem",
    "hei",
    "há",
    "havemos",
    "hão",
    "houve",
    "houvemos",
    "houveram",
    "houvera",
    "houvéramos",
    "haja",
    "hajamos",
    "hajam",
    "houvesse",
    "houvéssemos",
    "houvessem",
    "houver",
    "houvermos",
    "houverem",
    "houverei",
    "houverá",
    "houveremos",
    "houverão",
    "houveria",
    "houveríamos",
    "houveriam",
    "sou",
    "somos",
    "são",
    "era",
    "éramos",
    "eram",
    "fui",
    "foi",
    "fomos",
    "foram",
    "fora",
    "fôramos",
    "seja",
    "sejamos",
    "sejam",
    "fosse",
    "fôssemos",
    "fossem",
    "for",
    "formos",
    "forem",
    "serei",
    "será",
    "seremos",
    "serão",
    "seria",
    "seríamos",
    "seriam",
    "tenho",
    "tem",
    "temos",
    "tém",
    "tinha",
    "tínhamos",
    "tinham",
    "tive",
    "teve",
    "tivemos",
    "tiveram",
    "tivera",
    "tivéramos",
    "tenha",
    "tenhamos",
    "tenham",
    "tivesse",
    "tivéssemos",
    "tivessem",
    "tiver",
    "tivermos",
    "tiverem",
    "terei",
    "terá",
    "teremos",
    "terão",
    "teria",
    "teríamos",
    "teriam",
  ]);

  const frequencies = {};
  for (const word of words) {
    if (word && word.length > 2 && !stopwords.has(word)) {
      frequencies[word] = (frequencies[word] || 0) + 1;
    }
  }

  return Object.entries(frequencies)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);
};

module.exports = {
  getSurveyDetails,
  getQuestionsBySurveyId,
  getResponsesBySurveyId,
  getDailyStats,
  getWordCloudDataForSurvey,
};
