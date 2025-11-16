const { fromZonedTime } = require('date-fns-tz');

const timeZone = 'America/Sao_Paulo';

/**
 * Adjusts start and end date strings to a specific timezone.
 * Sets start date to the beginning of the day and end date to the end of the day.
 * @param {string} startDateStr - The start date in 'YYYY-MM-DD' format.
 * @param {string} endDateStr - The end date in 'YYYY-MM-DD' format.
 * @returns {{startDate: Date|null, endDate: Date|null}}
 */
const adjustDateRange = (startDateStr, endDateStr) => {
    let startDate = null;
    let endDate = null;

    if (startDateStr) {
        const parsedStart = fromZonedTime(`${startDateStr}T00:00:00`, timeZone);
        if (parsedStart && !isNaN(parsedStart.getTime())) {
            startDate = parsedStart;
        }
    }

    if (endDateStr) {
        const parsedEnd = fromZonedTime(`${endDateStr}T23:59:59.999`, timeZone);
        if (parsedEnd && !isNaN(parsedEnd.getTime())) {
            endDate = parsedEnd;
        }
    }

    return { startDate, endDate };
};

module.exports = {
    adjustDateRange,
    timeZone,
};