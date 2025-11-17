import { format, parseISO, isValid, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma string de data (preferencialmente ISO) para exibição ao usuário.
 * Converte a data para o fuso horário do navegador e a exibe no formato brasileiro.
 * @param {string | Date} dateInput - A data a ser formatada (string ISO ou objeto Date).
 * @param {string} formatString - O formato desejado (padrão: 'dd/MM/yyyy HH:mm').
 * @returns {string} A data formatada ou uma string vazia se a data for inválida.
 */
export const formatDateForDisplay = (dateInput, formatString = 'dd/MM/yyyy HH:mm') => {
  if (!dateInput) {
    return '';
  }

  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

  if (!isValid(date)) {
    return 'Data inválida';
  }

  return format(date, formatString, { locale: ptBR });
};

/**
 * Pega uma data (geralmente de um seletor de data) e retorna o início do dia
 * (00:00:00) no fuso horário local, convertido para uma string ISO 8601 em UTC.
 * Essencial para criar filtros de data consistentes para o backend.
 * @param {Date | number | null} date - O objeto Date do seletor.
 * @returns {string | null} A string ISO 8601 em UTC ou null se a entrada for nula.
 */
export const getStartOfDayUTC = (date) => {
  if (!date) {
    return null;
  }
  // startOfDay cria a data à meia-noite no fuso local do usuário
  // toISOString converte para o padrão UTC
  return startOfDay(date).toISOString();
};

/**
 * Pega uma data (geralmente de um seletor de data) e retorna o fim do dia
 * (23:59:59.999) no fuso horário local, convertido para uma string ISO 8601 em UTC.
 * Essencial para criar filtros de data consistentes para o backend.
 * @param {Date | number | null} date - O objeto Date do seletor.
 * @returns {string | null} A string ISO 8601 em UTC ou null se a entrada for nula.
 */
export const getEndOfDayUTC = (date) => {
  if (!date) {
    return null;
  }
  // endOfDay cria a data no último milissegundo do dia no fuso local do usuário
  // toISOString converte para o padrão UTC
  return endOfDay(date).toISOString();
};