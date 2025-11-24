import { format, parseISO, isValid, startOfDay, endOfDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Retorna a data e hora atual no fuso horário local do navegador.
 * Equivalente ao `now()` do backend, mas para o lado do cliente.
 * @returns {Date} A data e hora atual no fuso horário local.
 */
export const getNowInLocalTimezone = () => {
  return new Date();
};

/**
 * Analisa uma string de data no formato DD/MM/YYYY para um objeto Date,
 * considerando o fuso horário local.
 * @param {string} dateString - A string de data no formato DD/MM/YYYY.
 * @returns {Date | null} O objeto Date ou null se a string for inválida.
 */
export const parseBrazilianDate = (dateString) => {
  if (!dateString) {
    return null;
  }
  const parsed = parse(dateString, 'dd/MM/yyyy', getNowInLocalTimezone(), { locale: ptBR });
  return isValid(parsed) ? parsed : null;
};

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
 * (00:00:00) em UTC, como uma string ISO 8601.
 * Essencial para criar filtros de data consistentes para o backend.
 * @param {Date | number | null} date - O objeto Date do seletor.
 * @returns {string | null} A string ISO 8601 em UTC ou null se a entrada for nula.
 */
export const getStartOfDayUTC = (date) => {
  if (!date) {
    return null;
  }
  const d = new Date(date);
  // Cria uma nova data em UTC usando os componentes da data local
  const utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
  return utcDate.toISOString();
};

/**
 * Pega uma data (geralmente de um seletor de data) e retorna o fim do dia
 * (23:59:59.999) em UTC, como uma string ISO 8601.
 * Essencial para criar filtros de data consistentes para o backend.
 * @param {Date | number | null} date - O objeto Date do seletor.
 * @returns {string | null} A string ISO 8601 em UTC ou null se a entrada for nula.
 */
export const getEndOfDayUTC = (date) => {
  if (!date) {
    return null;
  }
  const d = new Date(date);
  // Cria uma nova data em UTC usando os componentes da data local
  const utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999));
  return utcDate.toISOString();
};