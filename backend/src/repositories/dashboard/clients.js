const { Client, Sequelize } = require('../../../models');
const { fromZonedTime } = require('date-fns-tz');
const { Op } = require('sequelize');

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
                Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "birthDate"')), currentMonth),
            ],
        },
        attributes: ['id', 'name', 'birthDate'],
        order: [[Sequelize.fn('EXTRACT', Sequelize.literal('DAY FROM "birthDate"')), 'ASC']],
    });

    return birthdays.map(client => ({
        id: client.id,
        name: client.name,
        birthDate: client.birthDate,
        day: new Date(client.birthDate).getDate(),
    }));
};

module.exports = {
    getBirthdaysOfMonth,
};
