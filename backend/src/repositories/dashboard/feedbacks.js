const { Resposta, Pergunta, Client, sequelize } = require("../../../models");
const { Op } = require("sequelize");
const { getUtcDateRange } = require("../../utils/dateUtils");
const { buildWhereClause } = require("../../utils/filterUtils");
const { PorterStemmerPt } = require("natural");
const stopwords = require("../../utils/stopwords");

const getFeedbacks = async (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });
  whereClause.textValue = { [Op.ne]: null, [Op.ne]: "" };

  const feedbacksData = await Resposta.findAll({
    where: whereClause,
    attributes: [
      "textValue",
      "ratingValue",
      "respondentSessionId",
      ["createdAt", "date"],
    ],
    order: [["createdAt", "DESC"]],
    limit: 7,
    include: [
      {
        model: Client,
        as: "client",
        attributes: ["name"],
        foreignKey: "respondentSessionId",
        targetKey: "respondentSessionId",
      },
    ],
  });

  return feedbacksData.map((feedback) => ({
    respondentSessionId: feedback.respondentSessionId,
    date: feedback.date,
    client: feedback.client ? feedback.client.name : "Anônimo",
    rating: feedback.ratingValue !== null ? feedback.ratingValue : null,
    comment: feedback.textValue,
  }));
};

const getAllFeedbacksForPeriod = async (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });
  whereClause.textValue = { [Op.ne]: null, [Op.ne]: "" };

  const feedbacksData = await Resposta.findAll({
    where: whereClause,
    attributes: [
      "textValue",
      "ratingValue",
      "respondentSessionId",
      ["createdAt", "date"],
    ],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Client,
        as: "client",
        attributes: ["name"],
        foreignKey: "respondentSessionId",
        targetKey: "respondentSessionId",
      },
    ],
  });

  return feedbacksData.map((feedback) => ({
    respondentSessionId: feedback.respondentSessionId,
    date: feedback.date,
    client: feedback.client ? feedback.client.name : "Anônimo",
    rating: feedback.ratingValue !== null ? feedback.ratingValue : null,
    comment: feedback.textValue,
  }));
};

const getWordCloudData = async (
  tenantId = null,
  startDateStr = null,
  endDateStr = null,
  surveyId = null,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, surveyId, dateRange });
  whereClause.textValue = { [Op.ne]: null, [Op.ne]: "" };

  const feedbacks = await Resposta.findAll({
    where: whereClause,
    attributes: ["textValue"],
    limit: 2000,
    order: [["createdAt", "DESC"]],
  });

  const text = feedbacks.map((f) => f.textValue).join(" ");
  const words = text
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, "")
    .split(/\s+/);

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
  getFeedbacks,
  getAllFeedbacksForPeriod,
  getWordCloudData,
};
