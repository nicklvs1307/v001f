const { Pesquisa, Resposta, Usuario, Tenant, Pergunta, Cupom, Atendente, AtendenteMeta, Client, Criterio } = require('../../models');
const { Sequelize, Op } = require('sequelize');

const { fn, col, literal } = Sequelize;

const dashboardRepository = {
    getSummary: async (tenantId = null, startDate = null, endDate = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const ratingResponses = await Resposta.findAll({
            where: {
                ...whereClause,
                ratingValue: { [Op.ne]: null }
            },
            include: [{
                model: Pergunta,
                as: 'pergunta',
                attributes: ['type'],
                where: {
                    type: 'rating_0_10' // Only fetch answers for NPS-style questions
                },
                required: true
            }],
            order: [['createdAt', 'ASC']] // Important to get the first response
        });

        const processedSessions = new Set();
        let promoters = 0;
        let neutrals = 0;
        let detractors = 0;

        ratingResponses.forEach(response => {
            if (!processedSessions.has(response.respondentSessionId)) {
                const rating = response.ratingValue;
                
                if (rating >= 9) {
                    promoters++;
                } else if (rating >= 7 && rating <= 8) {
                    neutrals++;
                } else {
                    detractors++;
                }
                processedSessions.add(response.respondentSessionId);
            }
        });

        const totalRatingResponses = processedSessions.size;
        let npsScore = 0;
        let promotersPercentage = 0;
        let neutralsPercentage = 0;
        let detractorsPercentage = 0;

        if (totalRatingResponses > 0) {
            promotersPercentage = (promoters / totalRatingResponses) * 100;
            neutralsPercentage = (neutrals / totalRatingResponses) * 100;
            detractorsPercentage = (detractors / totalRatingResponses) * 100;
            npsScore = promotersPercentage - detractorsPercentage;
        }

        const totalResponses = await Resposta.count({ where: whereClause });
        const totalUsers = await Client.count({ where: whereClause });

        // Crie um where clause específico para cupons gerados, aplicando o filtro de data a createdAt
        const couponsGeneratedWhere = tenantId ? { tenantId } : {};
        if (Object.keys(dateFilter).length > 0) {
            couponsGeneratedWhere.createdAt = dateFilter;
        }
        const couponsGenerated = await Cupom.count({ where: couponsGeneratedWhere });

        // Crie um where clause específico para cupons usados, aplicando o filtro de data a updatedAt
        const couponsUsedWhere = { status: 'used' };
        if (tenantId) {
            couponsUsedWhere.tenantId = tenantId;
        }
        if (Object.keys(dateFilter).length > 0) {
            couponsUsedWhere.updatedAt = dateFilter;
        }
        const couponsUsed = await Cupom.count({ where: couponsUsedWhere });

        return {
            npsScore: parseFloat(npsScore.toFixed(1)),
            promoters,
            promotersPercentage: parseFloat(promotersPercentage.toFixed(2)),
            neutrals,
            neutralsPercentage: parseFloat(neutralsPercentage.toFixed(2)),
            detractors,
            detractorsPercentage: parseFloat(detractorsPercentage.toFixed(2)),
            registrations: totalUsers,
            registrationsConversion: totalResponses > 0 ? parseFloat(((totalUsers / totalResponses) * 100).toFixed(2)) : 0,
            ambassadorsMonth: 0, // Manter como 0 por enquanto
            couponsGenerated,
            couponsGeneratedPeriod: 'N/A',
            couponsUsed,
            couponsUsedConversion: couponsGenerated > 0 ? parseFloat(((couponsUsed / couponsGenerated) * 100).toFixed(2)) : 0,
            totalResponses,
            totalUsers,
        };
    },

    getResponseChart: async (tenantId = null, startDate = null, endDate = null) => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const whereClause = tenantId ? { tenantId } : {};
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const responsesByDay = await Resposta.findAll({
            where: whereClause,
            attributes: [
                [fn('date_trunc', 'day', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: [fn('date_trunc', 'day', col('createdAt'))],
            order: [[fn('date_trunc', 'day', col('createdAt')), 'ASC']]
        });

        const chartData = [];
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(sevenDaysAgo.getDate() + i);
            const dayName = daysOfWeek[date.getDay()];
            const formattedDate = date.toISOString().split('T')[0];

            const found = responsesByDay.find(item => {
                const itemDate = new Date(item.dataValues.date);
                return itemDate.toISOString().split('T')[0] === formattedDate;
            });

            chartData.push({
                name: dayName,
                Respostas: found ? parseInt(found.dataValues.count) : 0,
            });
        }

        return chartData;
    },

    getRanking: async (tenantId = null, startDate = null, endDate = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const rankingData = await Resposta.findAll({
            where: whereClause,
            attributes: [
                'atendenteId',
                [fn('COUNT', col('Resposta.id')), 'occurrences']
            ],
            group: ['atendenteId', 'atendente.id', 'atendente.name'],
            order: [[literal('occurrences'), 'DESC']],
            limit: 5,
            include: [{
                model: Atendente,
                as: 'atendente',
                attributes: ['name']
            }]
        });

        const formattedRanking = rankingData.map((item, index) => ({
            atendenteId: item.atendenteId,
            ranking: `${index + 1}°`,
            name: item.atendente ? item.atendente.name : 'Desconhecido',
            occurrences: parseInt(item.dataValues.occurrences),
        }));

        return formattedRanking || [];
    },

    getNPSCritera: async (tenantId = null, startDate = null, endDate = null) => {
        const responseWhereClause = { ratingValue: { [Op.ne]: null } };
        if (tenantId) {
            responseWhereClause.tenantId = tenantId;
        }
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            responseWhereClause.createdAt = dateFilter;
        }

        const npsData = await Pergunta.findAll({
            attributes: [
                'id',
                'text',
                [fn('SUM', literal(`CASE WHEN "respostas"."ratingValue" >= 9 THEN 1 ELSE 0 END`)), 'promoters'],
                [fn('SUM', literal(`CASE WHEN "respostas"."ratingValue" BETWEEN 7 AND 8 THEN 1 ELSE 0 END`)), 'neutrals'],
                [fn('SUM', literal(`CASE WHEN "respostas"."ratingValue" <= 6 THEN 1 ELSE 0 END`)), 'detractors'],
                [fn('COUNT', col('respostas.id')), 'total']
            ],
            include: [{
                model: Resposta,
                as: 'respostas',
                attributes: [],
                where: responseWhereClause,
                required: true
            }],
            group: ['Pergunta.id', 'Pergunta.text'],
            where: {
                type: { [Op.like]: 'rating%' }
            }
        });

        return npsData.map(item => {
            const promoters = parseInt(item.dataValues.promoters) || 0;
            const detractors = parseInt(item.dataValues.detractors) || 0;
            const total = parseInt(item.dataValues.total) || 0;
            let nps = 0;
            if (total > 0) {
                nps = ((promoters / total) * 100) - ((detractors / total) * 100);
            }
            return {
                question: item.text,
                nps: parseFloat(nps.toFixed(1)),
                promoters,
                neutrals: parseInt(item.dataValues.neutrals) || 0,
                detractors,
                total,
            };
        });
    },

    getFeedbacks: async (tenantId = null, startDate = null, endDate = null) => {
        const whereClause = tenantId ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: '' } } : { textValue: { [Op.ne]: null, [Op.ne]: '' } };
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const feedbacksData = await Resposta.findAll({
            where: whereClause,
            attributes: ['createdAt', 'textValue', 'ratingValue', 'respondentSessionId'],
            order: [['createdAt', 'DESC']],
            limit: 7,
            include: [{
                model: Client,
                as: 'client',
                attributes: ['name'],
                foreignKey: 'respondentSessionId',
                targetKey: 'respondentSessionId'
            }]
        });

        return feedbacksData.map(feedback => ({
            respondentSessionId: feedback.respondentSessionId,
            date: new Date(feedback.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            client: feedback.client ? feedback.client.name : 'Anônimo',
            nps: feedback.ratingValue !== null ? feedback.ratingValue : null,
            comment: feedback.textValue,
        }));
    },

    getConversionChart: async (tenantId = null, startDate = null, endDate = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const totalResponses = await Resposta.count({ where: whereClause });
        const totalUsers = await Client.count({ where: whereClause });
        const couponsGenerated = await Cupom.count({ where: { ...whereClause, createdAt: dateFilter } });
        const couponsUsed = await Cupom.count({ where: { ...whereClause, status: 'used', updatedAt: dateFilter } });

        return [
            { name: 'Respostas', value: totalResponses },
            { name: 'Cadastros', value: totalUsers },
            { name: 'Cupons Gerados', value: couponsGenerated },
            { name: 'Cupons Utilizados', value: couponsUsed },
        ];
    },

    getOverallResults: async (tenantId = null) => {
        const whereClause = tenantId ? { tenantId } : {};

        const allResponses = await Resposta.findAll({
            where: { ...whereClause, ratingValue: { [Op.ne]: null } },
            include: [
                {
                    model: Pergunta,
                    as: 'pergunta',
                    attributes: ['type', 'criterioId'],
                    include: [{
                        model: Criterio,
                        as: 'criterio',
                        attributes: ['name'],
                    }]
                },
                {
                    model: Client,
                    as: 'client',
                    attributes: ['birthDate'],
                },
                {
                    model: Atendente,
                    as: 'atendente',
                    attributes: ['name'],
                }
            ]
        });

        // 1. Calcular NPS Geral
        let overallPromoters = 0;
        let overallNeutrals = 0;
        let overallDetractors = 0;
        
        // Filter for NPS questions (rating_0_10) before calculating the overall score
        const npsResponses = allResponses.filter(response => response.pergunta && response.pergunta.type === 'rating_0_10');
        const overallTotalRatingResponses = npsResponses.length;

        npsResponses.forEach(response => {
            const rating = response.ratingValue;

            if (rating !== null) {
                if (rating >= 9) {
                    overallPromoters++;
                } else if (rating >= 7 && rating <= 8) {
                    overallNeutrals++;
                } else {
                    overallDetractors++;
                }
            }
        });

        let overallNpsScore = 0;
        if (overallTotalRatingResponses > 0) {
            overallNpsScore = ((overallPromoters / overallTotalRatingResponses) * 100) - ((overallDetractors / overallTotalRatingResponses) * 100);
        }

        // 2. Calcular NPS por Critério (Agregado)
        const npsCriterioMap = new Map();

        allResponses.forEach(response => {
            const pergunta = response.pergunta;
            if (pergunta && pergunta.criterio && pergunta.type.startsWith('rating')) {
                const criterioName = pergunta.criterio.name;
                if (!npsCriterioMap.has(criterioName)) {
                    npsCriterioMap.set(criterioName, { promoters: 0, neutrals: 0, detractors: 0, total: 0 });
                }
                const criterioStats = npsCriterioMap.get(criterioName);

                const rating = response.ratingValue;
                if (rating !== null) {
                    criterioStats.total++;
                    if (pergunta.type === 'rating_1_5') {
                        if (rating === 5) criterioStats.promoters++;
                        else if (rating === 4) criterioStats.neutrals++;
                        else criterioStats.detractors++;
                    } else if (pergunta.type === 'rating_0_10') {
                        if (rating >= 9) criterioStats.promoters++;
                        else if (rating >= 7 && rating <= 8) criterioStats.neutrals++;
                        else criterioStats.detractors++;
                    }
                }
            }
        });

        const npsByCriterio = [];
        npsCriterioMap.forEach((stats, criterioName) => {
            let nps = 0;
            if (stats.total > 0) {
                nps = ((stats.promoters / stats.total) * 100) - ((stats.detractors / stats.total) * 100);
            }
            npsByCriterio.push({
                criterio: criterioName,
                nps: parseFloat(nps.toFixed(1)),
                promoters: stats.promoters,
                neutrals: stats.neutrals,
                detractors: stats.detractors,
                total: stats.total,
            });
        });

        // 3. Preparar dados para Radar Chart (média de avaliação por critério/pergunta)
        const radarDataMap = new Map();

        allResponses.forEach(response => {
            const pergunta = response.pergunta;
            if (pergunta && pergunta.type.startsWith('rating')) {
                const key = pergunta.criterio ? pergunta.criterio.name : (pergunta.id ? `Pergunta ${pergunta.id.substring(0, 4)}` : 'Pergunta Desconhecida'); // Usar critério ou ID da pergunta
                if (!radarDataMap.has(key)) {
                    radarDataMap.set(key, { sum: 0, count: 0 });
                }
                const dataStats = radarDataMap.get(key);

                const rating = response.ratingValue;
                if (rating !== null) {
                    dataStats.sum += rating;
                    dataStats.count++;
                }
            }
        });

        const radarChartData = [];
        radarDataMap.forEach((stats, name) => {
            const average = stats.count > 0 ? (stats.sum / stats.count) : 0;
            radarChartData.push({
                name: name,
                averageRating: parseFloat(average.toFixed(2)),
            });
        });

        // 4. Processar dados demográficos (idade)
        const birthDates = [];
        allResponses.forEach(response => {
            if (response.client && response.client.birthDate) {
                birthDates.push(new Date(response.client.birthDate));
            }
        });

        const demographics = {};
        if (birthDates.length > 0) {
            const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
            const currentYear = new Date().getFullYear();

            birthDates.forEach(dob => {
                const age = currentYear - dob.getFullYear();
                if (age >= 18 && age <= 24) ageGroups['18-24']++;
                else if (age >= 25 && age <= 34) ageGroups['25-34']++;
                else if (age >= 35 && age <= 44) ageGroups['35-44']++;
                else if (age >= 45 && age <= 54) ageGroups['45-54']++;
                else if (age >= 55) ageGroups['55+']++;
            });
            demographics.ageDistribution = ageGroups;
        }

        // 5. Top 5 Atendentes por respostas (e metas)
        const attendantPerformance = new Map();

        allResponses.forEach(response => {
            if (response.atendente && response.atendente.id) {
                const attendantId = response.atendente.id;
                const attendantName = response.atendente.name;

                if (!attendantPerformance.has(attendantId)) {
                    attendantPerformance.set(attendantId, {
                        id: attendantId,
                        name: attendantName,
                        responses: 0,
                        promoters: 0,
                        neutrals: 0,
                        detractors: 0,
                        npsGoal: 0,
                        responsesGoal: 0,
                        registrationsGoal: 0,
                        currentNPS: 0,
                    });
                }

                const stats = attendantPerformance.get(attendantId);
                stats.responses++;

                const rating = response.ratingValue;
                const questionType = response.pergunta ? response.pergunta.type : null;

                if (rating !== null && questionType) {
                    if (questionType === 'rating_1_5') {
                        if (rating === 5) stats.promoters++;
                        else if (rating === 4) stats.neutrals++;
                        else stats.detractors++;
                    } else if (questionType === 'rating_0_10') {
                        if (rating >= 9) stats.promoters++;
                        else if (rating >= 7 && rating <= 8) stats.neutrals++;
                        else stats.detractors++;
                    }
                }
            }
        });

        const topAttendantsWithGoals = [];
        const sortedAttendants = Array.from(attendantPerformance.values())
            .sort((a, b) => b.responses - a.responses)
            .slice(0, 5);

        for (const attendant of sortedAttendants) {
            const meta = await AtendenteMeta.findOne({
                where: { atendenteId: attendant.id, tenantId: tenantId },
            });

            if (meta) {
                attendant.npsGoal = meta.npsGoal || 0;
                attendant.responsesGoal = meta.responsesGoal || 0;
                attendant.registrationsGoal = meta.registrationsGoal || 0;
            }

            const totalRatingResponses = attendant.promoters + attendant.neutrals + attendant.detractors;
            if (totalRatingResponses > 0) {
                attendant.currentNPS = ((attendant.promoters / totalRatingResponses) * 100) - ((attendant.detractors / totalRatingResponses) * 100);
            }

            topAttendantsWithGoals.push({
                name: attendant.name,
                responses: attendant.responses,
                currentNPS: parseFloat(attendant.currentNPS.toFixed(1)),
                npsGoal: attendant.npsGoal,
                responsesGoal: attendant.responsesGoal,
                registrationsGoal: attendant.registrationsGoal,
            });
        }

        // 6. Respostas ao longo do tempo (reutilizando getResponseChart logic)
        const responseChartData = await this.getResponseChart(tenantId, null, null);

        return {
            overallNPS: parseFloat(overallNpsScore.toFixed(1)),
            npsPromoters: overallPromoters,
            npsNeutrals: overallNeutrals,
            npsDetractors: overallDetractors,
            npsTotalResponses: overallTotalRatingResponses,
            npsByCriterio,
            radarChartData,
            demographics,
            topAttendants: topAttendantsWithGoals,
            responseChartData,
        };
    },

    getWordCloudData: async (tenantId = null) => {
        const whereClause = tenantId ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: '' } } : { textValue: { [Op.ne]: null, [Op.ne]: '' } };

        const feedbacks = await Resposta.findAll({
            where: whereClause,
            attributes: ['textValue'],
        });

        const text = feedbacks.map(f => f.textValue).join(' ');

        // Simples processamento de texto: minúsculas, remove pontuação, etc.
        const words = text.toLowerCase().replace(/[.,!?;:"'()]/g, '').split(/\s+/);

        // Lista de stopwords em português a serem ignoradas
        const stopwords = new Set(['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'no', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram', 'estava', 'estávamos', 'estavam', 'estivera', 'estivéramos', 'esteja', 'estejamos', 'estejam', 'estivesse', 'estivéssemos', 'estivessem', 'estiver', 'estivermos', 'estiverem', 'hei', 'há', 'havemos', 'hão', 'houve', 'houvemos', 'houveram', 'houvera', 'houvéramos', 'haja', 'hajamos', 'hajam', 'houvesse', 'houvéssemos', 'houvessem', 'houver', 'houvermos', 'houverem', 'houverei', 'houverá', 'houveremos', 'houverão', 'houveria', 'houveríamos', 'houveriam', 'sou', 'somos', 'são', 'era', 'éramos', 'eram', 'fui', 'foi', 'fomos', 'foram', 'fora', 'fôramos', 'seja', 'sejamos', 'sejam', 'fosse', 'fôssemos', 'fossem', 'for', 'formos', 'forem', 'serei', 'será', 'seremos', 'serão', 'seria', 'seríamos', 'seriam', 'tenho', 'tem', 'temos', 'tém', 'tinha', 'tínhamos', 'tinham', 'tive', 'teve', 'tivemos', 'tiveram', 'tivera', 'tivéramos', 'tenha', 'tenhamos', 'tenham', 'tivesse', 'tivéssemos', 'tivessem', 'tiver', 'tivermos', 'tiverem', 'terei', 'terá', 'teremos', 'terão', 'teria', 'teríamos', 'teriam']);

        const frequencies = {};
        for (const word of words) {
            if (word && word.length > 2 && !stopwords.has(word)) {
                frequencies[word] = (frequencies[word] || 0) + 1;
            }
        }

        // Converte para o formato { text: 'palavra', value: frequencia }
        return Object.entries(frequencies)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value) // Ordena por frequência
            .slice(0, 100); // Limita a 100 palavras
    },

    getNpsTrendData: async (tenantId = null, period = 'day') => {
        const whereClause = tenantId ? { tenantId, ratingValue: { [Op.ne]: null } } : { ratingValue: { [Op.ne]: null } };

        const trendData = await Resposta.findAll({
            where: whereClause,
            include: [{
                model: Pergunta,
                as: 'pergunta',
                attributes: [],
                where: {
                    type: 'rating_0_10'
                },
                required: true
            }],
            attributes: [
                [fn('date_trunc', period, col('Resposta.createdAt')), 'period'],
                [fn('SUM', literal(`CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END`)), 'promoters'],
                [fn('SUM', literal(`CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END`)), 'detractors'],
                [fn('COUNT', col('Resposta.id')), 'total']
            ],
            group: [fn('date_trunc', period, col('Resposta.createdAt'))],
            order: [[fn('date_trunc', period, col('Resposta.createdAt')), 'ASC']]
        });

        return trendData.map(item => {
            const data = item.dataValues;
            const promoters = parseInt(data.promoters) || 0;
            const detractors = parseInt(data.detractors) || 0;
            const total = parseInt(data.total) || 0;
            let nps = 0;
            if (total > 0) {
                nps = ((promoters / total) * 100) - ((detractors / total) * 100);
            }
            return {
                period: new Date(data.period).toLocaleDateString('pt-BR'),
                nps: parseFloat(nps.toFixed(1)),
            };
        });
    },
    getAttendantsPerformanceWithGoals: async (tenantId = null) => {
        const whereClause = tenantId ? { tenantId } : {};

        const allResponses = await Resposta.findAll({
            where: { ...whereClause, ratingValue: { [Op.ne]: null } },
            include: [
                {
                    model: Pergunta,
                    as: 'pergunta',
                    attributes: ['type'],
                },
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id'], // Precisamos do ID do cliente para contar cadastros únicos
                },
                {
                    model: Atendente,
                    as: 'atendente',
                    attributes: ['id', 'name'],
                }
            ]
        });

        const attendantPerformance = new Map();

        allResponses.forEach(response => {
            if (response.atendente && response.atendente.id) {
                const attendantId = response.atendente.id;
                const attendantName = response.atendente.name;

                if (!attendantPerformance.has(attendantId)) {
                    attendantPerformance.set(attendantId, {
                        id: attendantId,
                        name: attendantName,
                        responses: 0,
                        promoters: 0,
                        neutrals: 0,
                        detractors: 0,
                        uniqueClients: new Set(), // Para contar cadastros únicos
                        npsGoal: 0,
                        responsesGoal: 0,
                        registrationsGoal: 0,
                        currentNPS: 0,
                    });
                }

                const stats = attendantPerformance.get(attendantId);
                stats.responses++;

                // Contar clientes únicos
                if (response.client && response.client.id) {
                    stats.uniqueClients.add(response.client.id);
                }

                const rating = response.ratingValue;
                const questionType = response.pergunta ? response.pergunta.type : null;

                if (rating !== null && questionType) {
                    if (questionType === 'rating_1_5') {
                        if (rating === 5) stats.promoters++;
                        else if (rating === 4) stats.neutrals++;
                        else stats.detractors++;
                    } else if (questionType === 'rating_0_10') {
                        if (rating >= 9) stats.promoters++;
                        else if (rating >= 7 && rating <= 8) stats.neutrals++;
                        else stats.detractors++;
                    }
                }
            }
        });

        const attendantsWithPerformance = [];
        for (const attendantStats of attendantPerformance.values()) {
            // Buscar a meta do atendente
            const meta = await AtendenteMeta.findOne({
                where: { atendenteId: attendantStats.id, tenantId: tenantId },
            });

            if (meta) {
                attendantStats.npsGoal = meta.npsGoal || 0;
                attendantStats.responsesGoal = meta.responsesGoal || 0;
                attendantStats.registrationsGoal = meta.registrationsGoal || 0;
            }

            // Calcular NPS atual
            const totalRatingResponses = attendantStats.promoters + attendantStats.neutrals + attendantStats.detractors;
            if (totalRatingResponses > 0) {
                attendantStats.currentNPS = ((attendantStats.promoters / totalRatingResponses) * 100) - ((attendantStats.detractors / totalRatingResponses) * 100);
            }

            attendantsWithPerformance.push({
                id: attendantStats.id,
                name: attendantStats.name,
                responses: attendantStats.responses,
                currentNPS: parseFloat(attendantStats.currentNPS.toFixed(1)),
                currentRegistrations: attendantStats.uniqueClients.size, // Número de clientes únicos
                npsGoal: attendantStats.npsGoal,
                responsesGoal: attendantStats.responsesGoal,
                registrationsGoal: attendantStats.registrationsGoal,
            });
        }

        return attendantsWithPerformance;
    },
    getBirthdaysOfMonth: async (tenantId = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11

        const birthdays = await Client.findAll({
            where: {
                ...whereClause,
                birthDate: {
                    [Op.ne]: null,
                },
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('birthDate')), currentMonth),
                ],
            },
            attributes: ['id', 'name', 'birthDate'],
            order: [[Sequelize.fn('DAY', Sequelize.col('birthDate')), 'ASC']],
        });

        return birthdays.map(client => ({
            id: client.id,
            name: client.name,
            birthDate: client.birthDate,
            day: new Date(client.birthDate).getDate(),
        }));
    },
    getDetailsByCategory: async (tenantId, category, startDate, endDate) => {
        const whereClause = tenantId ? { tenantId } : {};
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const categoryLower = category.toLowerCase();

        if (categoryLower === 'promotores' || categoryLower === 'neutros' || categoryLower === 'detratores') {
            let ratingWhere = {};
            if (categoryLower === 'promotores') {
                ratingWhere = { ratingValue: { [Op.gte]: 9 } };
            } else if (categoryLower === 'neutros') {
                ratingWhere = { ratingValue: { [Op.between]: [7, 8] } };
            } else { // detratores
                ratingWhere = { ratingValue: { [Op.lte]: 6 } };
            }

            return await Resposta.findAll({
                where: { ...whereClause, ...ratingWhere },
                include: [
                    { model: Client, as: 'client', attributes: ['name'] },
                    { model: Pergunta, as: 'pergunta', attributes: ['text'] }
                ],
                order: [['createdAt', 'DESC']],
            });
        }

        if (categoryLower === 'cadastros') {
            return await Client.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
            });
        }

        if (categoryLower === 'cupons gerados') {
            return await Cupom.findAll({
                where: whereClause,
                include: [{ model: Client, as: 'client', attributes: ['name'] }],
                order: [['createdAt', 'DESC']],
            });
        }

        if (categoryLower === 'cupons utilizados') {
            const usedWhere = { ...whereClause, status: 'used' };
            if (whereClause.createdAt) {
                usedWhere.updatedAt = whereClause.createdAt;
                delete usedWhere.createdAt;
            }
            return await Cupom.findAll({
                where: usedWhere,
                include: [{ model: Client, as: 'client', attributes: ['name'] }],
                order: [['updatedAt', 'DESC']],
            });
        }

        return []; // For "Ambresários no Mês" and any other unhandled category
    },

    getAttendantDetailsById: async (tenantId, attendantId, startDate, endDate) => {
        const whereClause = { atendenteId: attendantId };
        if (tenantId) {
            whereClause.tenantId = tenantId;
        }

        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const responses = await Resposta.findAll({
            where: whereClause,
            include: [
                { model: Client, as: 'client', attributes: ['name'] },
                { model: Pergunta, as: 'pergunta', attributes: ['text'] }
            ],
            order: [['createdAt', 'DESC']],
        });

        let promoters = 0;
        let neutrals = 0;
        let detractors = 0;

        responses.forEach(response => {
            const rating = response.ratingValue;
            if (rating !== null) {
                if (rating >= 9) {
                    promoters++;
                } else if (rating >= 7 && rating <= 8) {
                    neutrals++;
                } else {
                    detractors++;
                }
            }
        });

        const totalRatingResponses = promoters + neutrals + detractors;
        let npsScore = 0;
        if (totalRatingResponses > 0) {
            npsScore = ((promoters / totalRatingResponses) * 100) - ((detractors / totalRatingResponses) * 100);
        }

        const attendant = await Atendente.findByPk(attendantId, { attributes: ['name'] });

        return {
            attendantName: attendant ? attendant.name : 'Desconhecido',
            npsScore: parseFloat(npsScore.toFixed(1)),
            promoters,
            neutrals,
            detractors,
            totalResponses: responses.length,
            responses,
        };
    },

    getResponseDetailsBySessionId: async (tenantId, sessionId) => {
        const whereClause = { respondentSessionId: sessionId };
        if (tenantId) {
            whereClause.tenantId = tenantId;
        }

        const responses = await Resposta.findAll({
            where: whereClause,
            include: [
                { model: Client, as: 'client', attributes: ['name'] },
                { model: Pergunta, as: 'pergunta', attributes: ['text'] }
            ],
            order: [['createdAt', 'ASC']],
        });

        return responses;
    },

    getMainDashboard: async function (tenantId = null, startDate = null, endDate = null) {
        const summary = await this.getSummary(tenantId, startDate, endDate);
        const responseChart = await this.getResponseChart(tenantId, startDate, endDate);
        const ranking = await this.getRanking(tenantId, startDate, endDate);
        const npsCriteria = await this.getNPSCritera(tenantId, startDate, endDate);
        const feedbacks = await this.getFeedbacks(tenantId, startDate, endDate);
        const conversionChart = await this.getConversionChart(tenantId, startDate, endDate);

        return {
            summary,
            responseChart,
            ranking,
            npsCriteria,
            feedbacks,
            conversionChart,
        };
    },
};

module.exports = dashboardRepository;