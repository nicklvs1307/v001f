const cron = require('node-cron');
const { Op } = require('sequelize');
const { AtendenteMeta, Atendente, Resposta, Recompensa, AtendentePremiacao, Tenant } = require('../../models');
const { calculateNPS } = require('../utils/npsCalculator');
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz');
const { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths } = require('date-fns');

const awardProcessorJob = async () => {
    console.log('Iniciando job de processamento de premiações...');

    try {
        // Encontrar todas as metas que possuem uma recompensa associada e estão ativas
        const metasComRecompensa = await AtendenteMeta.findAll({
            where: {
                recompensaId: { [Op.ne]: null }
            },
            include: [
                { model: Atendente, as: 'atendente' },
                { model: Recompensa, as: 'recompensa' },
                { model: Tenant, as: 'tenant' }
            ]
        });

        for (const meta of metasComRecompensa) {
            const { atendente, recompensa, npsGoal, responsesGoal, registrationsGoal, period, tenant } = meta;

            if (!atendente || !recompensa || !tenant) {
                console.warn(`Skipping meta ${meta.id} due to missing attendant, reward or tenant data.`);
                continue;
            }

            // Definir o intervalo de tempo para cálculo com base no 'period' da meta
            const tenantTimezone = tenant.timezone || 'America/Sao_Paulo';
            const now = utcToZonedTime(new Date(), tenantTimezone); // Data e hora atual no fuso horário do tenant
            let startDate, endDate;

            switch (period) {
                case 'DIARIO':
                    startDate = startOfDay(subDays(now, 1));
                    endDate = endOfDay(subDays(now, 1));
                    break;
                case 'SEMANAL':
                    // Para SEGUNDA-FEIRA como início da semana (ISO week-date), startOfWeek(date, { weekStartsOn: 1 })
                    startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
                    endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
                    break;
                case 'MENSAL':
                    startDate = startOfMonth(subMonths(now, 1));
                    endDate = endOfMonth(subMonths(now, 1));
                    break;
                default:
                    console.warn(`Período desconhecido para a meta ${meta.id}: ${period}. Pulando.`);
                    continue;
            }
            
            // Converter para UTC para a query do banco de dados
            const startUtc = zonedTimeToUtc(startDate, tenantTimezone);
            const endUtc = zonedTimeToUtc(endDate, tenantTimezone);

            // Verificar se o prêmio já foi concedido para este atendente/meta/período
            const existingPremiacao = await AtendentePremiacao.findOne({
                where: {
                    atendenteId: atendente.id,
                    atendenteMetaId: meta.id,
                    recompensaId: recompensa.id,
                    dateAwarded: {
                        [Op.between]: [startUtc, endUtc] // Compara com as datas UTC de registro
                    }
                }
            });

            if (existingPremiacao) {
                console.log(`Prêmio para atendente ${atendente.name} e meta ${meta.id} já concedido para o período ${period}. Pulando.`);
                continue;
            }

            let metricValueAchieved = 0;
            let awarded = false;

            // Lógica para NPS Goal
            if (npsGoal > 0) {
                const respostasNPS = await Resposta.findAll({
                    where: {
                        atendenteId: atendente.id,
                        createdAt: {
                            [Op.between]: [startUtc, endUtc]
                        },
                        // Apenas respostas com avaliação de 0-10 são usadas para NPS
                        rating_0_10: { [Op.ne]: null }
                    }
                });
                if (respostasNPS.length > 0) {
                    metricValueAchieved = calculateNPS(respostasNPS.map(r => r.rating_0_10));
                    if (metricValueAchieved >= npsGoal) {
                        awarded = true;
                    }
                }
            }

            // Lógica para Responses Goal (apenas se não for premiado por NPS ou se for uma meta adicional)
            if (!awarded && responsesGoal > 0) {
                const countResponses = await Resposta.count({
                    where: {
                        atendenteId: atendente.id,
                        createdAt: {
                            [Op.between]: [startUtc, endUtc]
                        }
                    }
                });
                if (countResponses >= responsesGoal) {
                    metricValueAchieved = countResponses;
                    awarded = true;
                }
            }

            // Lógica para Registrations Goal (aqui assumindo que registrationsGoal é para clientes cadastrados pelo atendente)
            // ATENÇÃO: É preciso ter um campo no Cliente que indique qual atendente o cadastrou.
            // Por enquanto, vamos pular registrationsGoal a menos que tenhamos essa ligação.
            // Se o Atendente tiver uma relação com Cliente (ex: client.atendenteId = atendente.id)
            /*
            if (!awarded && registrationsGoal > 0) {
                const countRegistrations = await Cliente.count({ // Assumindo modelo Cliente existe
                    where: {
                        atendenteId: atendente.id, // Supondo que Cliente tem atendenteId
                        createdAt: {
                            [Op.between]: [startUtc, endUtc]
                        }
                    }
                });
                if (countRegistrations >= registrationsGoal) {
                    metricValueAchieved = countRegistrations;
                    awarded = true;
                }
            }
            */

            if (awarded) {
                await AtendentePremiacao.create({
                    tenantId: tenant.id,
                    atendenteId: atendente.id,
                    atendenteMetaId: meta.id,
                    recompensaId: recompensa.id,
                    dateAwarded: startUtc, // Registra a data de início do período que a meta foi atingida
                    metricValueAchieved: metricValueAchieved
                });
                console.log(`Prêmio ${recompensa.name} concedido a ${atendente.name} por atingir meta ${meta.id} com valor ${metricValueAchieved}.`);
            }
        }
    } catch (error) {
        console.error('Erro no job de processamento de premiações:', error);
    }

    console.log('Job de processamento de premiações finalizado.');
};

// module.exports = awardProcessorJob;
