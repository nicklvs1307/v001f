const { Client, Resposta } = require("../../../models");
// const { subDays } = require("date-fns"); // No longer needed here
const sequelize = require("sequelize");
const { Op } = sequelize;
const {
  // convertToTimeZone, // No longer needed here
  convertFromTimeZone,
} = require("../../utils/dateUtils");

const getBirthdaysOfMonth = async (tenantId = null) => {
  const whereClause = tenantId ? { tenantId } : {};
  const currentMonth = convertFromTimeZone(new Date()).getMonth() + 1; // getMonth() returns 0-11

  const birthdays = await Client.findAll({
    where: {
      ...whereClause,
      birthDate: {
        [Op.ne]: null,
      },
      [Op.and]: [
        sequelize.where(
          sequelize.fn("EXTRACT", sequelize.literal('MONTH FROM "birthDate"')),
          currentMonth,
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

const getClientStatusCounts = async (tenantId = null, startOfDayUtc, endOfDayUtc) => {
  const whereClause = tenantId ? { tenantId } : {};

  // Use the already processed UTC Date objects
  if (startOfDayUtc && endOfDayUtc) {
    whereClause.createdAt = { [Op.gte]: startOfDayUtc, [Op.lte]: endOfDayUtc };
  }

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
