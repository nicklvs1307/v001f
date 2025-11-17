const { Client, Resposta } = require("../../../models");
const { subDays } = require("date-fns");
const sequelize = require("sequelize");
const { Op } = sequelize;
const {
  convertToTimeZone,
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

const getClientStatusCounts = async (tenantId = null, startDate, endDate) => {
  const whereClause = tenantId ? { tenantId } : {};

  if (startDate || endDate) {
    const endInput = endDate ? new Date(`${endDate}T23:59:59.999`) : new Date();
    const end = convertToTimeZone(endInput);

    const startInput = startDate
      ? new Date(`${startDate}T00:00:00.000`)
      : subDays(endInput, 6);
    const start = convertToTimeZone(startInput);

    whereClause.createdAt = { [Op.gte]: start, [Op.lte]: end };
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
