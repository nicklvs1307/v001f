const { Resposta, Pergunta, Client, sequelize } = require("../../../models");
const { Op } = require("sequelize");
const { subDays } = require("date-fns");
const { convertToTimeZone } = require("../../utils/dateUtils");
const { PorterStemmerPt } = require("natural");
const stopwords = require("../../utils/stopwords");

const getFeedbacks = async (
  tenantId = null,
  startDate = null,
  endDate = null,
  surveyId = null,
) => {
  const whereClause = tenantId
    ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: "" } }
    : { textValue: { [Op.ne]: null, [Op.ne]: "" } };
  if (startDate || endDate) {
    const endInput = endDate ? new Date(`${endDate}T23:59:59.999`) : new Date();
    const startInput = startDate
      ? new Date(`${startDate}T00:00:00.000`)
      : subDays(endInput, 6);

    if (!isNaN(startInput) && !isNaN(endInput)) {
      const end = convertToTimeZone(endInput);
      const start = convertToTimeZone(startInput);
      whereClause.createdAt = { [Op.gte]: start, [Op.lte]: end };
    }
  }
  const feedbacksData = await Resposta.findAll({
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

const getWordCloudData = async (
  tenantId = null,
  startDate = null,
  endDate = null,
  surveyId = null,
) => {
  const whereClause = tenantId
    ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: "" } }
    : { textValue: { [Op.ne]: null, [Op.ne]: "" } };
  if (startDate || endDate) {
    const endInput = endDate ? new Date(`${endDate}T23:59:59.999`) : new Date();
    const startInput = startDate
      ? new Date(`${startDate}T00:00:00.000`)
      : subDays(endInput, 6);

    if (!isNaN(startInput) && !isNaN(endInput)) {
      const end = convertToTimeZone(endInput);
      const start = convertToTimeZone(startInput);
      whereClause.createdAt = { [Op.gte]: start, [Op.lte]: end };
    }
  }
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
    const stemmedWord = PorterStemmerPt.stem(word);
    if (
      stemmedWord &&
      stemmedWord.length > 2 &&
      !stopwords.has(word) &&
      !stopwords.has(stemmedWord)
    ) {
      frequencies[stemmedWord] = (frequencies[stemmedWord] || 0) + 1;
    }
  }

  return Object.entries(frequencies)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);
};

module.exports = {
  getFeedbacks,
  getWordCloudData,
};
