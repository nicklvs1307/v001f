const { Client, Sequelize } = require('../../../models');
const { Op } = require('sequelize');

const getBirthdaysOfMonth = async (tenantId = null) => {
    const whereClause = tenantId ? { tenantId } : {};
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11

    const birthdays = await Client.findAll({
        where: {
            ...whereClause,
            birthDate: {
                [Op.ne]: null,
            },
            [Op.and]: [
                Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('birthDate')), currentMonth),
            ],
        },
        attributes: ['id', 'name', 'birthDate'],
        order: [[Sequelize.fn('DAY', Sequelize.col('birthDate')), 'ASC']],
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
