/**
 * Sanitiza e tenta converter uma string de data para o formato YYYY-MM-DD.
 * Suporta DD/MM/YYYY e outros formatos reconhecidos pelo construtor Date.
 * @param {string} value A string de data a ser sanitizada.
 * @returns {string|null} A data sanitizada no formato YYYY-MM-DD ou null se inválida/vazia.
 */
const sanitizeBirthDate = (value) => {
  if (!value) return null;

  // Tenta converter de DD/MM/YYYY para YYYY-MM-DD
  const parts = String(value).split('/');
  if (parts.length === 3 && parts[2].length === 4) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    const date = new Date(`${year}-${month}-${day}`);
    if (!isNaN(date.getTime())) {
      return `${year}-${month}-${day}`;
    } else {
      // Se a data DD/MM/YYYY for inválida, tenta como outros formatos
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Ignora erro de parsing
      }
    }
  }

  // Tenta converter de outros formatos reconhecidos pelo construtor Date
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // Ignora erro de parsing
  }

  return null; // Retorna null se não for possível sanitizar para um formato válido
};

module.exports = {
  sanitizeBirthDate,
};
