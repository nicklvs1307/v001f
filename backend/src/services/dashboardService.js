const dashboardRepository = require("../repositories/dashboardRepository");

const getAttendantsPerformance = (tenantId, startDate, endDate) => {
    return dashboardRepository.getAttendantsPerformance(tenantId, startDate, endDate);
};

const getAttendantResponsesTimeseries = (tenantId, period, startDate, endDate, atendenteId) => {
    return dashboardRepository.getAttendantResponsesTimeseries(tenantId, period, startDate, endDate, atendenteId);
};

const getRanking = (tenantId, startDate, endDate) => {
    // A lógica de ordenação já está no repositório
    return dashboardRepository.getAttendantsPerformance(tenantId, startDate, endDate);
};


// Adicionar outras funções do dashboard aqui conforme necessário
module.exports = {
    getAttendantsPerformance,
    getAttendantResponsesTimeseries,
    getRanking,
};
