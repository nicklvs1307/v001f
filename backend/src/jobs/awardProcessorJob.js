const cron = require('node-cron');
const { Op } = require('sequelize');
const { AtendenteMeta, Atendente, Resposta, AtendentePremiacao, Tenant, Cliente } = require('../../models');
const { calculateNPS } = require('../utils/npsCalculator');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, getDaysInMonth } = require('date-fns');

const awardProcessorJob = async () => {
    console.log('Iniciando job de processamento de premiações...');

    try {
        // Encontrar todas as metas que possuem algum valor de prêmio definido
        const metasComPremio = await AtendenteMeta.findAll({
            where: {
                [Op.or]: [
                    { nps_premio_valor: { [Op.gt]: 0 } },
                    { respostas_premio_valor: { [Op.gt]: 0 } },
                    { cadastros_premio_valor: { [Op.gt]: 0 } }
                ]
            },
            include: [
                { model: Atendente, as: 'atendente' },
                { model: Tenant, as: 'tenant' }
            ]
        });

        console.log(`Encontradas ${metasComPremio.length} metas com prêmios para processar.`);

        for (const meta of metasComPremio) {
            const { 
              atendente, tenant, period,
              npsGoal, nps_premio_valor,
              responsesGoal, respostas_premio_valor,
              registrationsGoal, cadastros_premio_valor,
              dias_trabalhados
            } = meta;

            if (!atendente || !tenant) {
                console.warn(`Pulando meta ${meta.id} por falta de dados de atendente ou tenant.`);
                continue;
            }

            // --- Cálculo do Período ---
            const tenantTimezone = tenant.timezone || 'America/Sao_Paulo';
            const now = utcToZonedTime(new Date(), tenantTimezone);
            let startDate, endDate;

            switch (period) {
                case 'DIARIO':
                    startDate = startOfDay(subDays(now, 1));
                    endDate = endOfDay(subDays(now, 1));
                    break;
                case 'SEMANAL':
                    startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
                    endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
                    break;
                case 'MENSAL':
                    startDate = startOfMonth(subMonths(now, 1));
                    endDate = endOfMonth(subMonths(now, 1));
                    break;
                default:
                    console.warn(`Período desconhecido para a meta ${meta.id}: ${period}.`);
                    continue;
            }
            
            const startUtc = zonedTimeToUtc(startDate, tenantTimezone);
            const endUtc = zonedTimeToUtc(endDate, tenantTimezone);

            // --- Processamento de cada Métrica ---
            
            // 1. Meta de NPS
            if (npsGoal && nps_premio_valor > 0) {
                const respostas = await Resposta.findAll({
                    where: {
                        atendenteId: atendente.id, createdAt: { [Op.between]: [startUtc, endUtc] },
                        rating_0_10: { [Op.ne]: null }
                    }
                });
                const npsCalculado = calculateNPS(respostas.map(r => r.rating_0_10));
                
                if (npsCalculado >= npsGoal) {
                    await registrarPremiacao(meta, 'NPS', npsCalculado, nps_premio_valor, startUtc);
                }
            }

            // 2. Meta de Pesquisas Respondidas
            if (responsesGoal && respostas_premio_valor > 0) {
                // Cálculo proporcional
                const diasNoPeriodo = period === 'MENSAL' ? getDaysInMonth(startDate) : (period === 'SEMANAL' ? 7 : 1);
                const metaProporcional = Math.ceil((responsesGoal / (dias_trabalhados || 22)) * diasNoPeriodo);

                const totalPesquisas = await Resposta.count({
                    distinct: true,
                    col: 'pesquisaId',
                    where: { atendenteId: atendente.id, createdAt: { [Op.between]: [startUtc, endUtc] } }
                });

                if (totalPesquisas >= metaProporcional) {
                    await registrarPremiacao(meta, 'Pesquisas', totalPesquisas, respostas_premio_valor, startUtc);
                }
            }

            // 3. Meta de Cadastros
            // Esta lógica depende do modelo Cliente ter uma associação com Atendente.
            // if (registrationsGoal && cadastros_premio_valor > 0) {
            //     ... lógica para contar clientes cadastrados pelo atendente ...
            // }
        }
    } catch (error) {
        console.error('Erro no job de processamento de premiações:', error);
    }

    console.log('Job de processamento de premiações finalizado.');
};

// Função auxiliar para evitar duplicação de código
async function registrarPremiacao(meta, tipoMeta, valorAtingido, valorPremio, dataPeriodo) {
    // Verifica se já não existe uma premiação para este tipo de meta no período.
    const existingAward = await AtendentePremiacao.findOne({
        where: {
            atendenteMetaId: meta.id,
            // Adicionar um campo "tipo_meta" seria ideal para diferenciar prêmios na mesma meta
            // Por enquanto, vamos usar a data para evitar duplicação no mesmo ciclo de job.
            dateAwarded: dataPeriodo, 
        }
    });

    if (existingAward) {
        console.log(`Prêmio de ${tipoMeta} para meta ${meta.id} já registrado neste período.`);
        return;
    }
    
    await AtendentePremiacao.create({
        tenantId: meta.tenantId,
        atendenteId: meta.atendenteId,
        atendenteMetaId: meta.id,
        // O campo recompensaId foi removido do modelo AtendentePremiacao na lógica anterior, mas seria útil.
        // Adicionando um campo de descrição para a premiação.
        descricao_premio: `Prêmio por meta de ${tipoMeta}`,
        valor_premio: valorPremio,
        dateAwarded: dataPeriodo,
        metricValueAchieved: valorAtingido
    });
    console.log(`Prêmio de R$${valorPremio} concedido a ${meta.atendente.name} por atingir meta de ${tipoMeta} com valor ${valorAtingido}.`);
}


const awardProcessingTask = cron.schedule(
    '0 2 * * *', // Todos os dias às 2h da manhã
    awardProcessorJob,
    {
        scheduled: false,
        timezone: 'America/Sao_Paulo'
    }
);

module.exports = {
  start: () => {
    console.log("Agendador de processamento de premiações iniciado. A tarefa será executada todo dia às 2h.");
    awardProcessingTask.start();
  },
  stop: () => {
    console.log("Agendador de processamento de premiações parado.");
    awardProcessingTask.stop();
  },
};