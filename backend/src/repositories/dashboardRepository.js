const { Pesquisa, Resposta, Usuario, Tenant, Pergunta, Cupom, Atendente, AtendenteMeta, Client, Criterio } = require('../../models');
const { Sequelize, Op } = require('sequelize');
const npsService = require('../services/npsService');

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
                    type: { [Op.or]: ['rating_0_10', 'rating_1_5'] }
                },
                required: true
            }],
            // A lógica de contagem de respostas únicas deve ser revista,
            // mas por agora vamos focar em padronizar o cálculo do NPS.
            // A contagem de respostas distintas por respondentSessionId foi removida
            // para evitar a subcontagem de respostas de NPS válidas.
        });

        // Utiliza o npsService para calcular o NPS
        const npsResult = npsService.calculateNPS(ratingResponses);

        const totalRatingResponses = npsResult.total;
        let promotersPercentage = 0;
        let neutralsPercentage = 0;
        let detractorsPercentage = 0;

        if (totalRatingResponses > 0) {
            promotersPercentage = (npsResult.promoters / totalRatingResponses) * 100;
            neutralsPercentage = (npsResult.neutrals / totalRatingResponses) * 100;
            detractorsPercentage = (npsResult.detractors / totalRatingResponses) * 100;
        }

        const totalResponses = await Resposta.count({ where: { ...whereClause, respondentSessionId: { [Op.ne]: null } }, distinct: true, col: 'respondentSessionId' });
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
            npsScore: npsResult.npsScore,
            promoters: npsResult.promoters,
            promotersPercentage: parseFloat(promotersPercentage.toFixed(2)),
            neutrals: npsResult.neutrals,
            neutralsPercentage: parseFloat(neutralsPercentage.toFixed(2)),
            detractors: npsResult.detractors,
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
                [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'occurrences']
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

        const allRatingResponses = await Resposta.findAll({
            where: responseWhereClause,
            include: [{
                model: Pergunta,
                as: 'pergunta',
                attributes: ['id', 'text', 'type', 'criterioId'],
                where: { type: { [Op.like]: 'rating%' } },
                required: true,
                include: [{
                    model: Criterio,
                    as: 'criterio',
                    attributes: ['name'],
                }]
            }],
        });

        const responsesByCriteria = allRatingResponses.reduce((acc, response) => {
            const criteriaName = response.pergunta.criterio ? response.pergunta.criterio.name : 'Sem Critério';
            if (!acc[criteriaName]) {
                acc[criteriaName] = [];
            }
            acc[criteriaName].push(response);
            return acc;
        }, {});

        const npsByCriteria = Object.entries(responsesByCriteria).map(([criteriaName, responses]) => {
            const npsResult = npsService.calculateNPS(responses);
            return {
                question: criteriaName, // Mantendo a chave 'question' para consistência com o frontend
                nps: npsResult.npsScore,
                promoters: npsResult.promoters,
                neutrals: npsResult.neutrals,
                detractors: npsResult.detractors,
                total: npsResult.total,
            };
        });

        return npsByCriteria;
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

        const totalResponses = await Resposta.count({ 
            where: whereClause, 
            distinct: true,
            col: 'respondentSessionId' 
        });
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

    getOverallResults: async function (tenantId = null) {
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
                    attributes: ['birthDate', 'gender'],
                },
                {
                    model: Atendente,
                    as: 'atendente',
                    attributes: ['name'],
                }
            ]
        });

        // 1. Calcular NPS Geral
        const npsResponses = allResponses.filter(response => response.pergunta && response.pergunta.type === 'rating_0_10');
        const overallNpsResult = npsService.calculateNPS(npsResponses);

        // 2. Calcular NPS por Critério (Agregado)
        const responsesByCriteria = allResponses.reduce((acc, response) => {
            if (response.pergunta && response.pergunta.criterio && response.pergunta.type.startsWith('rating')) {
                const criteriaName = response.pergunta.criterio.name;
                if (!acc[criteriaName]) {
                    acc[criteriaName] = [];
                }
                acc[criteriaName].push(response);
            }
            return acc;
        }, {});

        const npsByCriterio = Object.entries(responsesByCriteria).map(([criterioName, responses]) => {
            const npsResult = npsService.calculateNPS(responses);
            return {
                criterio: criterioName,
                nps: npsResult.npsScore,
                promoters: npsResult.promoters,
                neutrals: npsResult.neutrals,
                detractors: npsResult.detractors,
                total: npsResult.total,
            };
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

        // 4. Processar dados demográficos
        const demographics = {};
        const birthDates = [];
        const genders = [];
        allResponses.forEach(response => {
            if (response.client) {
                if (response.client.birthDate) {
                    birthDates.push(new Date(response.client.birthDate));
                }
                if (response.client.gender) {
                    genders.push(response.client.gender);
                }
            }
        });

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

        if (genders.length > 0) {
            const genderDistribution = { 'masculino': 0, 'feminino': 0, 'outro': 0 };
            genders.forEach(gender => {
                const g = gender.toLowerCase();
                if (genderDistribution.hasOwnProperty(g)) {
                    genderDistribution[g]++;
                } else {
                    genderDistribution['outro']++;
                }
            });
            demographics.genderDistribution = genderDistribution;
        }


        // 5. Top e Bottom 5 Atendentes por respostas (e metas)
        const responsesByAttendant = allResponses.reduce((acc, response) => {
            if (response.atendente && response.atendente.id) {
                const attendantId = response.atendente.id;
                if (!acc[attendantId]) {
                    acc[attendantId] = {
                        id: attendantId,
                        name: response.atendente.name,
                        responses: [],
                    };
                }
                acc[attendantId].responses.push(response);
            }
            return acc;
        }, {});

        const attendantsArray = Object.values(responsesByAttendant);

        const topAttendantsWithGoals = [];
        const sortedAttendantsTop = [...attendantsArray].sort((a, b) => b.responses.length - a.responses.length).slice(0, 5);

        for (const attendant of sortedAttendantsTop) {
            const npsResult = npsService.calculateNPS(attendant.responses);
            const meta = await AtendenteMeta.findOne({
                where: { atendenteId: attendant.id, tenantId: tenantId },
            });

            topAttendantsWithGoals.push({
                name: attendant.name,
                responses: attendant.responses.length,
                currentNPS: npsResult.npsScore,
                npsGoal: meta ? meta.npsGoal || 0 : 0,
                responsesGoal: meta ? meta.responsesGoal || 0 : 0,
                registrationsGoal: meta ? meta.registrationsGoal || 0 : 0,
            });
        }

        const bottomAttendantsWithGoals = [];
        const sortedAttendantsBottom = [...attendantsArray].sort((a, b) => a.responses.length - b.responses.length).slice(0, 5);

        for (const attendant of sortedAttendantsBottom) {
            const npsResult = npsService.calculateNPS(attendant.responses);
            const meta = await AtendenteMeta.findOne({
                where: { atendenteId: attendant.id, tenantId: tenantId },
            });

            bottomAttendantsWithGoals.push({
                name: attendant.name,
                responses: attendant.responses.length,
                currentNPS: npsResult.npsScore,
                npsGoal: meta ? meta.npsGoal || 0 : 0,
                responsesGoal: meta ? meta.responsesGoal || 0 : 0,
                registrationsGoal: meta ? meta.registrationsGoal || 0 : 0,
            });
        }

        // 6. Respostas ao longo do tempo (reutilizando getResponseChart logic)
        const responseChartData = await this.getResponseChart(tenantId, null, null);

        return {
            overallNPS: overallNpsResult.npsScore,
            npsPromoters: overallNpsResult.promoters,
            npsNeutrals: overallNpsResult.neutrals,
            npsDetractors: overallNpsResult.detractors,
            npsTotalResponses: overallNpsResult.total,
            npsByCriterio,
            radarChartData,
            demographics,
            topAttendants: topAttendantsWithGoals,
            bottomAttendants: bottomAttendantsWithGoals,
            responseChartData,
        };
    },

    getWordCloudData: async (tenantId = null) => {
        const whereClause = tenantId ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: '' } } : { textValue: { [Op.ne]: null, [Op.ne]: '' } };

        const feedbacks = await Resposta.findAll({
            where: whereClause,
            attributes: ['textValue'],
            include: [{
                model: Pergunta,
                as: 'pergunta',
                attributes: [],
                where: {
                    type: 'free_text'
                },
                required: true
            }]
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
    getNpsByDayOfWeek: async (tenantId = null) => {
        const whereClause = tenantId ? { tenantId, ratingValue: { [Op.ne]: null } } : { ratingValue: { [Op.ne]: null } };

        const responses = await Resposta.findAll({
            where: whereClause,
            include: [{
                model: Pergunta,
                as: 'pergunta',
                attributes: ['type'],
                where: {
                    type: 'rating_0_10'
                },
                required: true
            }],
            attributes: ['createdAt', 'ratingValue']
        });

        const npsByDay = {
            'Domingo': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
            'Segunda-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
            'Terça-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
            'Quarta-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
            'Quinta-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
            'Sexta-feira': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
            'Sábado': { promoters: 0, neutrals: 0, detractors: 0, total: 0 },
        };

        const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

        responses.forEach(response => {
            const dayOfWeek = new Date(response.createdAt).getDay(); // 0 for Sunday, 6 for Saturday
            const dayName = daysOfWeek[dayOfWeek];

            const classification = npsService.classifyRating(response.ratingValue, response.pergunta.type);

            if (classification) {
                npsByDay[dayName].total++;
                if (classification === 'promoter') npsByDay[dayName].promoters++;
                else if (classification === 'neutral') npsByDay[dayName].neutrals++;
                else if (classification === 'detractor') npsByDay[dayName].detractors++;
            }
        });

        const result = Object.entries(npsByDay).map(([day, counts]) => {
            let npsScore = 0;
            if (counts.total > 0) {
                npsScore = ((counts.promoters / counts.total) * 100) - ((counts.detractors / counts.total) * 100);
            }
            return {
                day,
                nps: parseFloat(npsScore.toFixed(1)),
            };
        });

        return result;
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

        const attendantPerformance = allResponses.reduce((acc, response) => {
            if (response.atendente && response.atendente.id) {
                const attendantId = response.atendente.id;
                if (!acc[attendantId]) {
                    acc[attendantId] = {
                        id: attendantId,
                        name: response.atendente.name,
                        responses: [],
                        uniqueClients: new Set(),
                    };
                }
                acc[attendantId].responses.push(response);
                if (response.client && response.client.id) {
                    acc[attendantId].uniqueClients.add(response.client.id);
                }
            }
            return acc;
        }, {});

        const attendantsWithPerformance = [];
        for (const attendantStats of Object.values(attendantPerformance)) {
            const npsResult = npsService.calculateNPS(attendantStats.responses);
            const meta = await AtendenteMeta.findOne({
                where: { atendenteId: attendantStats.id, tenantId: tenantId },
            });

            attendantsWithPerformance.push({
                id: attendantStats.id,
                name: attendantStats.name,
                responses: attendantStats.responses.length,
                currentNPS: npsResult.npsScore,
                currentRegistrations: attendantStats.uniqueClients.size,
                npsGoal: meta ? meta.npsGoal || 0 : 0,
                responsesGoal: meta ? meta.responsesGoal || 0 : 0,
                registrationsGoal: meta ? meta.registrationsGoal || 0 : 0,
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
                ratingWhere = {
                    [Op.or]: [
                        { '$pergunta.type$': 'rating_0_10', ratingValue: { [Op.gte]: 9 } },
                        { '$pergunta.type$': 'rating_1_5', ratingValue: { [Op.eq]: 5 } },
                    ]
                };
            } else if (categoryLower === 'neutros') {
                ratingWhere = {
                    [Op.or]: [
                        { '$pergunta.type$': 'rating_0_10', ratingValue: { [Op.between]: [7, 8] } },
                        { '$pergunta.type$': 'rating_1_5', ratingValue: { [Op.eq]: 4 } },
                    ]
                };
            } else { // detratores
                ratingWhere = {
                    [Op.or]: [
                        { '$pergunta.type$': 'rating_0_10', ratingValue: { [Op.lte]: 6 } },
                        { '$pergunta.type$': 'rating_1_5', ratingValue: { [Op.lte]: 3 } },
                    ]
                };
            }

            return await Resposta.findAll({
                where: { ...whereClause, ...ratingWhere },
                include: [
                    { model: Client, as: 'client', attributes: ['name'] },
                    { model: Pergunta, as: 'pergunta', attributes: ['text', 'type'] }
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
                { 
                    model: Pergunta, 
                    as: 'pergunta', 
                    attributes: ['text', 'type'] // Incluir o tipo da pergunta
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        // Filtrar apenas respostas de avaliação para o cálculo de NPS
        const ratingResponses = responses.filter(r => r.ratingValue !== null && r.pergunta && r.pergunta.type.startsWith('rating'));

        const npsResult = npsService.calculateNPS(ratingResponses);
        const attendant = await Atendente.findByPk(attendantId, { attributes: ['name'] });

        return {
            attendantName: attendant ? attendant.name : 'Desconhecido',
            npsScore: npsResult.npsScore,
            promoters: npsResult.promoters,
            neutrals: npsResult.neutrals,
            detractors: npsResult.detractors,
            totalResponses: responses.length, // Total de interações
            responses, // Respostas detalhadas
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
        const npsByDayOfWeek = await this.getNpsByDayOfWeek(tenantId);

        return {
            summary,
            responseChart,
            ranking,
            npsCriteria,
            feedbacks,
            conversionChart,
            npsByDayOfWeek,
        };
    },
};

module.exports = dashboardRepository;