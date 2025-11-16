const { Client, Resposta } = require('../../../models');
const { fromZonedTime } = require('date-fns-tz');
const sequelize = require('sequelize');
const { Op } = sequelize;

const getBirthdaysOfMonth = async (tenantId = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    const currentMonth = fromZonedTime(new Date(), 'America/Sao_Paulo').getMonth() + 1; // getMonth() returns 0-11

    const birthdays = await Client.findAll({
        where: {
            ...whereClause,
            birthDate: {
                [Op.ne]: null,
            },
            [Op.and]: [
                sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "birthDate"')), currentMonth),
            ],
        },
        attributes: ['id', 'name', 'birthDate'],
        order: [[sequelize.fn('EXTRACT', sequelize.literal('DAY FROM "birthDate"')), 'ASC']],
    });

    return birthdays.map(client => ({
        id: client.id,
        name: client.name,
        birthDate: client.birthDate,
        day: new Date(client.birthDate).getDate(),
    }));
};

const getClientStatusCounts = async (tenantId = null, startDate, endDate) => {
    const whereClause = tenantId ? { tenantId } : {};
    if (startDate && endDate) {
        whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
        };
    }

    const result = await Resposta.findOne({
        where: whereClause,
        attributes: [
            [
                sequelize.literal('COUNT(DISTINCT "Resposta"."respondentSessionId") FILTER (WHERE "cliente"."id" IS NOT NULL)'),
                'withClient'
            ],
            [
                sequelize.literal('COUNT(DISTINCT "Resposta"."respondentSessionId") FILTER (WHERE "cliente"."id" IS NULL)'),
                'withoutClient'
            ],
        ],
        include: [{
            model: Client,
            as: 'cliente',
            attributes: []
        }],
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
