const { zonedTimeToUtc, fromZonedTime, toZonedTime, format } = require("date-fns-tz");
const { toDate, subDays, startOfDay, endOfDay } = require("date-fns");
const { ptBR } = require("date-fns/locale");

const TIMEZONE = "America/Sao_Paulo";

/**
 * Converte uma data para o fuso horário UTC, considerando o fuso padrão da aplicação.
 * @param {Date | string | number} date - A data a ser convertida.
 * @returns {Date} A data convertida para UTC.
 */
const convertToTimeZone = (date) => {
  return fromZonedTime(date, TIMEZONE);
};

/**
 * Converte uma data de um fuso horário específico para o horário local do sistema.
 * @param {Date | string | number} date - A data a ser convertida.
 * @returns {Date} A data convertida.
 */
const convertFromTimeZone = (date) => {
  return fromZonedTime(date, TIMEZONE);
};

/**
 * Converte uma data para um fuso horário específico.
 * @param {Date | string | number} date - A data a ser convertida.
 * @returns {Date} A data convertida.
 */
const convertToZonedTime = (date) => {
  return toZonedTime(date, TIMEZONE);
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
 * Se as strings não forem fornecidas, aplica valores padrão.
 * @param {string | null} startDateStr - A string da data de início em formato ISO 8601 UTC.
 * @param {string | null} endDateStr - A string da data de fim em formato ISO 8601 UTC.
 * @returns {{startDate: Date | null, endDate: Date | null}} Um objeto contendo as datas.
 */
const getUtcDateRange = (startDateStr, endDateStr) => {
  let endDate = null;
  if (endDateStr) {
    const parsed = toDate(new Date(endDateStr));
    if (!isNaN(parsed.getTime())) {
      endDate = parsed;
    }
  } else {
    endDate = endOfDay(new Date());
  }

  let startDate = null;
  if (startDateStr) {
    const parsed = toDate(new Date(startDateStr));
    if (!isNaN(parsed.getTime())) {
      startDate = parsed;
    }
  } else {
    startDate = startOfDay(subDays(endDate, 6));
  }

  return { startDate, endDate };
};

module.exports = {
  TIMEZONE,
  convertToTimeZone,
  formatInTimeZone,
  convertFromTimeZone,
  convertToZonedTime,
  getUtcDateRange,
};

