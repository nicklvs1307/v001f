const atendenteRepository = require("../repositories/atendenteRepository");
const ApiError = require("../errors/ApiError");
const { customAlphabet } = require("nanoid");

// Gera códigos de 6 caracteres alfanuméricos em maiúsculas. Ex: "A5T8B1"
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

const createAtendente = async (tenantId, name, status) => {
  const code = nanoid();
  try {
    const atendente = await atendenteRepository.createAtendente(
      tenantId,
      name,
      status,
      code,
    );
    return atendente;
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      // Em uma chance astronômica de colisão, informa o erro.
      throw new ApiError(
        500,
        "Falha ao gerar um código único. Tente novamente.",
      );
    }
    throw error; // Lança outros erros
  }
};

const getAllAtendentes = (tenantId) => {
  return atendenteRepository.getAllAtendentes(tenantId);
};

const getAtendenteById = (id, tenantId) => {
  return atendenteRepository.getAtendenteById(id, tenantId);
};

const updateAtendente = (id, tenantId, name, status) => {
  return atendenteRepository.updateAtendente(id, tenantId, name, status);
};

const deleteAtendente = (id, tenantId) => {
  return atendenteRepository.deleteAtendente(id, tenantId);
};

const getAtendentePremiacoes = (id, tenantId) => {
  return atendenteRepository.findPremiacoesByAtendenteId(id, tenantId);
};

const getAtendentePerformance = (id, tenantId) => {
  return atendenteRepository.findAtendentePerformanceById(id, tenantId);
};

module.exports = {
  createAtendente,
  getAllAtendentes,
  getAtendenteById,
  updateAtendente,
  deleteAtendente,
  getAtendentePremiacoes,
  getAtendentePerformance,
};
