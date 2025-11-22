const { toDate, subDays, startOfDay, endOfDay } = require("date-fns");
const { ptBR } = require("date-fns/locale");
const { utcToZonedTime, zonedTimeToUtc, format } = require("date-fns-tz");

const TIMEZONE = "America/Sao_Paulo";

/**
 * Retorna a data e hora atual no fuso horário de São Paulo.
 * @returns {Date} A data e hora atual em São Paulo.
 */
const now = () => {
  return utcToZonedTime(new Date(), TIMEZONE);
};

/**
 * Converte uma data (assumida como UTC) para o fuso horário de São Paulo.
 * @param {Date | string | number} date - A data em UTC.
 * @returns {Date} A data convertida para o fuso de São Paulo.
 */
const convertToTimeZone = (date) => {
  return utcToZonedTime(date, TIMEZONE);
};

/**
 * Converte uma data no fuso horário de São Paulo para UTC.
 * @param {Date | string | number} date - A data em São Paulo.
 * @returns {Date} A data convertida para UTC.
 */
const convertToUtc = (date) => {
  return zonedTimeToUtc(date, TIMEZONE);
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
 * Processa strings de data de início e fim (que devem ser ISO 8601 UTC) e retorna objetos Date.
 * Se as strings não forem fornecidas, aplica valores padrão usando o fuso horário correto.
 * @param {string | null} startDateStr - A string da data de início em formato ISO 8601 UTC.
 * @param {string | null} endDateStr - A string da data de fim em formato ISO 8601 UTC.
 * @returns {{startDate: Date, endDate: Date}} Um objeto contendo as datas.
 */
const getUtcDateRange = (startDateStr, endDateStr) => {
  const currentTimeInZone = now();

  let endDate;
  if (endDateStr) {
    const parsed = toDate(new Date(endDateStr));
    endDate = !isNaN(parsed.getTime()) ? parsed : endOfDay(currentTimeInZone);
  } else {
    endDate = endOfDay(currentTimeInZone);
  }

  let startDate;
  if (startDateStr) {
    const parsed = toDate(new Date(startDateStr));
    startDate = !isNaN(parsed.getTime())
      ? parsed
      : startOfDay(subDays(endDate, 6));
  } else {
    startDate = startOfDay(subDays(endDate, 6));
  }

  return { startDate, endDate };
};

module.exports = {
  TIMEZONE,
  now,
  convertToTimeZone,
  convertToUtc,
  formatInTimeZone,
  getUtcDateRange,
};
