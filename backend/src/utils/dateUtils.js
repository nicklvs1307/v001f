const {
  zonedTimeToUtc,
  format,
  toDate,
  fromZonedTime,
  toZonedTime,
} = require("date-fns-tz");
const { ptBR } = require("date-fns/locale");

const TIMEZONE = "America/Sao_Paulo";

/**
 * Converte uma data para o fuso horário UTC, considerando o fuso padrão da aplicação.
 * @param {Date | string | number} date - A data a ser convertida.
 * @returns {Date} A data convertida para UTC.
 */
const convertToTimeZone = (date) => {
  return zonedTimeToUtc(date, TIMEZONE);
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
  const zonedDate = toDate(date, { timeZone: TIMEZONE });
  return format(zonedDate, formatString, {
    timeZone: TIMEZONE,
    locale: ptBR,
  });
};

module.exports = {
  TIMEZONE,
  convertToTimeZone,
  formatInTimeZone,
  convertFromTimeZone,
  convertToZonedTime,
};
