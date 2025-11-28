const { Client, Resposta } = require("../../../models");
// const { subDays } = require("date-fns"); // No longer needed here
const sequelize = require("sequelize");
const { Op } = sequelize;
const {
  // convertToTimeZone, // No longer needed here
  convertFromTimeZone,
  now,
  getUtcDateRange,
} = require("../../utils/dateUtils");
const { buildWhereClause } = require("../../utils/filterUtils");

const getBirthdaysOfMonth = async (
  tenantId = null,
  startOfDayUtc = null,
  endOfDayUtc = null,
) => {
  const whereClause = tenantId ? { tenantId } : {};

  // Determine the month to query. Use the start date's month if available, otherwise use the current month.
  const referenceDate = startOfDayUtc ? new Date(startOfDayUtc) : now();
  const monthToQuery = convertFromTimeZone(referenceDate).getMonth() + 1; // getMonth() is 0-11

  const birthdays = await Client.findAll({
    where: {
      ...whereClause,
      birthDate: {
        [Op.ne]: null,
      },
      [Op.and]: [
        sequelize.where(
          sequelize.fn("EXTRACT", sequelize.literal('MONTH FROM "birthDate"')),
          monthToQuery,
        ),
      ],
    },
    attributes: ["id", "name", "birthDate"],
    order: [
      [
        sequelize.fn("EXTRACT", sequelize.literal('DAY FROM "birthDate"')),
        "ASC",
      ],
    ],
  });

  return birthdays.map((client) => ({
    id: client.id,
    name: client.name,
    birthDate: client.birthDate,
    day: new Date(client.birthDate).getDate(),
  }));
};

const getClientStatusCounts = async (
  tenantId = null,
  startDateStr,
  endDateStr,
) => {
  const dateRange = getUtcDateRange(startDateStr, endDateStr);
  const whereClause = buildWhereClause({ tenantId, dateRange });

  const result = await Resposta.findOne({
    where: whereClause,
    attributes: [
      [
        sequelize.literal(
          'COUNT(DISTINCT "Resposta"."respondentSessionId") FILTER (WHERE "client"."id" IS NOT NULL)',
        ),
        "withClient",
      ],
      [
        sequelize.literal(
          'COUNT(DISTINCT "Resposta"."respondentSessionId") FILTER (WHERE "client"."id" IS NULL)',
        ),
        "withoutClient",
      ],
    ],
    include: [
      {
        model: Client,
        as: "client",
        attributes: [],
      },
    ],
    raw: true,
  });

  return {
    withClient: parseInt(result.withClient, 10) || 0,
    withoutClient: parseInt(result.withoutClient, 10) || 0,
  };
};

module.exports = {
  getBirthdaysOfMonth,
  getClientStatusCounts,
};
