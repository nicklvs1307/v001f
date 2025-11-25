const {
  toDate,
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
} = require("date-fns");
const { ptBR } = require("date-fns/locale");
const { toZonedTime, fromZonedTime, format } = require("date-fns-tz");

const TIMEZONE = "America/Sao_Paulo";

/**
 * Retorna a data e hora atual no fuso horário de São Paulo.
 * @returns {Date} A data e hora atual em São Paulo.
 */
const now = () => {
  return toZonedTime(new Date(), TIMEZONE);
};

/**
 * Converte uma data (assumida como UTC) para o fuso horário de São Paulo.
 * @param {Date | string | number} date - A data em UTC.
 * @returns {Date} A data convertida para o fuso de São Paulo.
 */
const convertToTimeZone = (date) => {
  return toZonedTime(date, TIMEZONE);
};

/**
 * Converte uma data no fuso horário de São Paulo para UTC.
 * @param {Date | string | number} date - A data em São Paulo.
 * @returns {Date} A data convertida para UTC.
 */
const convertToUtc = (date) => {
  return fromZonedTime(date, TIMEZONE);
};

/**
 * Formata uma data em um formato específico, ajustada para o fuso horário padrão.
 * @param {Date | string | number} date - A data a ser formatada.
 * @param {string} formatString - O formato desejado (ex: 'dd/MM/yyyy HH:mm:ss').
 * @returns {string} A data formatada.
 */
const formatInTimeZone = (date, formatString) => {
  const dateObj = toDate(date);
  return format(dateObj, formatString, {
    timeZone: TIMEZONE,
    locale: ptBR,
  });
};

/**
 * Processa strings de data de início e fim ou um período e uma data,
 * e retorna os objetos Date de início e fim no fuso horário correto,
 * convertidos para UTC.
 * @param {string | null} startDateStr - A string da data de início em formato ISO 8601 UTC.
 * @param {string | null} endDateStr - A string da data de fim em formato ISO 8601 UTC.
 * @param {string} period - O período para o qual calcular as datas ('day', 'week', 'month').
 * @param {Date | string | null} date - Uma data de referência para o cálculo do período.
 * @returns {{startDate: Date, endDate: Date}} Um objeto contendo as datas de início e fim em UTC.
 */
const getPeriodDateRange = (startDateStr, endDateStr, period = "day", date = now()) => {
  let startDate;
  let endDate;
  let referenceDate = toZonedTime(date, TIMEZONE);

  if (startDateStr && endDateStr) {
    startDate = toDate(new Date(startDateStr));
    endDate = toDate(new Date(endDateStr));
  } else {
    switch (period) {
      case "day":
        startDate = startOfDay(referenceDate);
        endDate = endOfDay(referenceDate);
        break;
      case "week":
        startDate = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Segunda-feira
        endDate = endOfWeek(referenceDate, { weekStartsOn: 1 }); // Domingo
        break;
      case "month":
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
        break;
      default:
        startDate = startOfDay(referenceDate);
        endDate = endOfDay(referenceDate);
        break;
    }
  }

  return { startDate: convertToUtc(startDate), endDate: convertToUtc(endDate) };
};

module.exports = {
  TIMEZONE,
  now,
  convertToTimeZone,
  convertToUtc,
  formatInTimeZone,
  getPeriodDateRange,
  getStartOfDayUTC: (date) => convertToUtc(startOfDay(toZonedTime(date, TIMEZONE))),
  getEndOfDayUTC: (date) => convertToUtc(endOfDay(toZonedTime(date, TIMEZONE))),
  getNowInLocalTimezone: now,
  startOfWeek: (date) => startOfWeek(toZonedTime(date, TIMEZONE), { weekStartsOn: 1 }),
  endOfWeek: (date) => endOfWeek(toZonedTime(date, TIMEZONE), { weekStartsOn: 1 }),
  startOfMonth: (date) => startOfMonth(toZonedTime(date, TIMEZONE)),
  endOfMonth: (date) => endOfMonth(toZonedTime(date, TIMEZONE)),
  addDays: (date, days) => addDays(toZonedTime(date, TIMEZONE), days),
};
