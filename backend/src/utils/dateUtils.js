const { zonedTimeToUtc, fromZonedTime, toZonedTime, format } = require("date-fns-tz");
const { toDate, subDays } = require("date-fns");
const { ptBR } = require("date-fns/locale");

const TIMEZONE = "America/Sao_Paulo"; // Keep for formatInTimeZone and convertToZonedTime if needed

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
 * Processa strings de data de início e fim para retornar um objeto com datas UTC padronizadas.
 * As datas de início são definidas para 00:00:00.000Z e as datas de fim para 23:59:59.999Z.
 * Se startDateStr não for fornecido, ele será padronizado para 6 dias antes de endDateStr (ou da data atual).
 * Se endDateStr não for fornecido, ele será padronizado para a data atual.
 * @param {string | null} startDateStr - A string da data de início no formato 'YYYY-MM-DD'.
 * @param {string | null} endDateStr - A string da data de fim no formato 'YYYY-MM-DD'.
 * @returns {{startOfDayUtc: Date | null, endOfDayUtc: Date | null}} Um objeto contendo as datas UTC padronizadas.
 */
const getUtcDateRange = (startDateStr, endDateStr) => {
  let startOfDayUtc = null;
  let endOfDayUtc = null;

  // Determine endOfDayUtc
  if (endDateStr) {
    const parsedEndDate = new Date(`${endDateStr}T23:59:59.999Z`); // Interpret as UTC
    if (!isNaN(parsedEndDate.getTime())) { // Use getTime() to check for valid date
      endOfDayUtc = parsedEndDate;
    }
  } else {
    // Default to end of current day in UTC
    const now = new Date();
    endOfDayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  }

  // Determine startOfDayUtc
  if (startDateStr) {
    const parsedStartDate = new Date(`${startDateStr}T00:00:00.000Z`); // Interpret as UTC
    if (!isNaN(parsedStartDate.getTime())) { // Use getTime() to check for valid date
      startOfDayUtc = parsedStartDate;
    }
  } else if (endOfDayUtc) {
    // Default to 6 days before endOfDayUtc
    startOfDayUtc = subDays(endOfDayUtc, 6);
    startOfDayUtc.setUTCHours(0, 0, 0, 0); // Ensure it's start of the day
  } else {
    // Fallback if both are missing (shouldn't happen with default endOfDayUtc)
    const now = new Date();
    startOfDayUtc = subDays(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())), 6);
    startOfDayUtc.setUTCHours(0, 0, 0, 0);
  }

  return { startOfDayUtc, endOfDayUtc };
};

module.exports = {
  TIMEZONE,
  formatInTimeZone,
  convertToZonedTime,
  getUtcDateRange, // Export the new utility function
};