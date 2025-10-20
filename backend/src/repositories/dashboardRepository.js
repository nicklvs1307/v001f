const { Pesquisa, Resposta, Usuario, Tenant, Pergunta, Cupom, Atendente, AtendenteMeta, Client, Criterio } = require('../../models');
const { Sequelize, Op } = require('sequelize');
const ratingService = require('../services/ratingService');

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
        });

        const npsResponses = ratingResponses.filter(r => r.pergunta.type === 'rating_0_10');
        const csatResponses = ratingResponses.filter(r => r.pergunta.type === 'rating_1_5');

        const npsResult = ratingService.calculateNPS(npsResponses);
        const csatResult = ratingService.calculateCSAT(csatResponses);

        const totalResponses = await Resposta.count({ where: { ...whereClause, respondentSessionId: { [Op.ne]: null } }, distinct: true, col: 'respondentSessionId' });
        const totalUsers = await Client.count({ where: whereClause });

        const couponsGeneratedWhere = tenantId ? { tenantId } : {};
        if (Object.keys(dateFilter).length > 0) {
            couponsGeneratedWhere.createdAt = dateFilter;
        }
        const couponsGenerated = await Cupom.count({ where: couponsGeneratedWhere });

        const couponsUsedWhere = { status: 'used' };
        if (tenantId) {
            couponsUsedWhere.tenantId = tenantId;
        }
        if (Object.keys(dateFilter).length > 0) {
            couponsUsedWhere.updatedAt = dateFilter;
        }
        const couponsUsed = await Cupom.count({ where: couponsUsedWhere });

        return {
            nps: {
                score: npsResult.npsScore,
                promoters: npsResult.promoters,
                neutrals: npsResult.neutrals,
                detractors: npsResult.detractors,
                total: npsResult.total,
            },
            csat: {
                satisfactionRate: csatResult.satisfactionRate,
                averageScore: csatResult.averageScore,
                satisfied: csatResult.satisfied,
                neutral: csatResult.neutral,
                unsatisfied: csatResult.unsatisfied,
                total: csatResult.total,
            },
            registrations: totalUsers,
            registrationsConversion: totalResponses > 0 ? parseFloat(((totalUsers / totalResponses) * 100).toFixed(2)) : 0,
            couponsGenerated,
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

    getCriteriaScores: async (tenantId = null, startDate = null, endDate = null) => {
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
                    attributes: ['name', 'type'], // Include criterio type
                }]
            }],
        });

        const responsesByCriteria = allRatingResponses.reduce((acc, response) => {
            const criteriaName = response.pergunta.criterio ? response.pergunta.criterio.name : 'Sem Critério';
            if (!acc[criteriaName]) {
                acc[criteriaName] = {
                    responses: [],
                    // Assuming all questions under a criterion have the same type, which they should.
                    // We can grab the type from the first response.
                    type: response.pergunta.criterio ? response.pergunta.criterio.type : null
                };
            }
            acc[criteriaName].responses.push(response);
            return acc;
        }, {});

        const scoresByCriteria = Object.entries(responsesByCriteria).map(([criteriaName, data]) => {
            const { responses, type } = data;
            
            if (type === 'NPS') {
                const npsResult = ratingService.calculateNPS(responses);
                return {
                    criterion: criteriaName,
                    scoreType: 'NPS',
                    score: npsResult.npsScore,
                    promoters: npsResult.promoters,
                    neutrals: npsResult.neutrals,
                    detractors: npsResult.detractors,
                    total: npsResult.total,
                };
            } else if (type === 'CSAT' || type === 'Star') {
                const csatResult = ratingService.calculateCSAT(responses);
                return {
                    criterion: criteriaName,
                    scoreType: 'CSAT',
                    score: csatResult.satisfactionRate,
                    average: csatResult.averageScore,
                    satisfied: csatResult.satisfied,
                    neutral: csatResult.neutral,
                    unsatisfied: csatResult.unsatisfied,
                    total: csatResult.total,
                };
            } else {
                // Handle other types or return a default structure
                return {
                    criterion: criteriaName,
                    scoreType: type,
                    total: responses.length,
                    // Maybe calculate average for any rating type as a fallback
                    average: responses.reduce((sum, r) => sum + r.ratingValue, 0) / responses.length,
                };
            }
        });

        return scoresByCriteria;
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
            rating: feedback.ratingValue !== null ? feedback.ratingValue : null,
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
                    attributes: ['id', 'type', 'criterioId'],
                    include: [{
                        model: Criterio,
                        as: 'criterio',
                        attributes: ['name', 'type'],
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
                    attributes: ['id', 'name'],
                }
            ]
        });

        // 1. Calcular Scores Gerais (NPS e CSAT)
        const npsResponses = allResponses.filter(r => r.pergunta && r.pergunta.type === 'rating_0_10');
        const csatResponses = allResponses.filter(r => r.pergunta && r.pergunta.type === 'rating_1_5');
        
        const overallNpsResult = ratingService.calculateNPS(npsResponses);
        const overallCsatResult = ratingService.calculateCSAT(csatResponses);

        // 2. Calcular Scores por Critério (reutilizando a lógica de getCriteriaScores)
        const responsesByCriteria = allResponses.reduce((acc, response) => {
            if (response.pergunta && response.pergunta.criterio && response.pergunta.type.startsWith('rating')) {
                const criteriaName = response.pergunta.criterio.name;
                if (!acc[criteriaName]) {
                    acc[criteriaName] = {
                        responses: [],
                        type: response.pergunta.criterio.type
                    };
                }
                acc[criteriaName].responses.push(response);
            }
            return acc;
        }, {});

        const scoresByCriteria = Object.entries(responsesByCriteria).map(([criteriaName, data]) => {
            const { responses, type } = data;
            if (type === 'NPS') {
                const npsResult = ratingService.calculateNPS(responses);
                return { criterion: criteriaName, scoreType: 'NPS', ...npsResult };
            } else if (type === 'CSAT' || type === 'Star') {
                const csatResult = ratingService.calculateCSAT(responses);
                return { criterion: criteriaName, scoreType: 'CSAT', ...csatResult };
            }
            return null;
        }).filter(Boolean);

        // 3. Preparar dados para Radar Chart (Média de avaliação por critério)
        const radarDataMap = new Map();
        allResponses.forEach(response => {
            const pergunta = response.pergunta;
            if (pergunta && pergunta.type.startsWith('rating')) {
                const key = pergunta.criterio ? pergunta.criterio.name : 'Outros';
                if (!radarDataMap.has(key)) {
                    radarDataMap.set(key, { sum: 0, count: 0 });
                }
                const dataStats = radarDataMap.get(key);
                if (response.ratingValue !== null) {
                    dataStats.sum += response.ratingValue;
                    dataStats.count++;
                }
            }
        });
        const radarChartData = Array.from(radarDataMap.entries()).map(([name, stats]) => ({
            name: name,
            averageRating: stats.count > 0 ? parseFloat((stats.sum / stats.count).toFixed(2)) : 0,
        }));


        // 4. Processar dados demográficos
        const demographics = {};
        const birthDates = [];
        const genders = [];
        allResponses.forEach(response => {
            if (response.client) {
                if (response.client.birthDate) birthDates.push(new Date(response.client.birthDate));
                if (response.client.gender) genders.push(response.client.gender);
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
                if (genderDistribution.hasOwnProperty(g)) genderDistribution[g]++;
                else genderDistribution['outro']++;
            });
            demographics.genderDistribution = genderDistribution;
        }

        // 5. Top e Bottom 5 Atendentes por performance
        const responsesByAttendant = allResponses.reduce((acc, response) => {
            if (response.atendente && response.atendente.id) {
                const attendantId = response.atendente.id;
                if (!acc[attendantId]) {
                    acc[attendantId] = { id: attendantId, name: response.atendente.name, responses: [] };
                }
                acc[attendantId].responses.push(response);
            }
            return acc;
        }, {});

        const attendantsArray = await Promise.all(Object.values(responsesByAttendant).map(async (attendant) => {
            const npsResult = ratingService.calculateNPS(attendant.responses);
            const csatResult = ratingService.calculateCSAT(attendant.responses);
            const meta = await AtendenteMeta.findOne({ where: { atendenteId: attendant.id, tenantId: tenantId } });
            return {
                name: attendant.name,
                responses: attendant.responses.length,
                nps: npsResult,
                csat: csatResult,
                meta: meta || {},
            };
        }));

        const sortedAttendants = attendantsArray.sort((a, b) => (b.nps.npsScore || 0) - (a.nps.npsScore || 0) || (b.csat.averageScore || 0) - (a.csat.averageScore || 0));
        
        const topAttendants = sortedAttendants.slice(0, 5);
        const bottomAttendants = sortedAttendants.slice(-5).reverse();

        // 6. Respostas ao longo do tempo
        const responseChartData = await this.getResponseChart(tenantId, null, null);

        return {
            overallNPS: overallNpsResult,
            overallCSAT: overallCsatResult,
            scoresByCriteria,
            radarChartData,
            demographics,
            topAttendants,
            bottomAttendants,
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

            const classification = ratingService.classifyNPS(response.ratingValue);

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
                    attributes: ['id'],
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
            const npsResult = ratingService.calculateNPS(attendantStats.responses);
            const csatResult = ratingService.calculateCSAT(attendantStats.responses);
            const meta = await AtendenteMeta.findOne({
                where: { atendenteId: attendantStats.id, tenantId: tenantId },
            });

            attendantsWithPerformance.push({
                id: attendantStats.id,
                name: attendantStats.name,
                responses: attendantStats.responses.length,
                currentNPS: npsResult.npsScore,
                currentCSAT: csatResult.averageScore,
                currentRegistrations: attendantStats.uniqueClients.size,
                npsGoal: meta ? meta.npsGoal || 0 : 0,
                csatGoal: meta ? meta.csatGoal || 0 : 0, // Assuming a csatGoal might exist
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
        let ratingWhere = {};

        switch (categoryLower) {
            case 'promotores':
                ratingWhere = { '$pergunta.type$': 'rating_0_10', ratingValue: { [Op.gte]: 9 } };
                break;
            case 'neutros': // NPS Neutral
                ratingWhere = { '$pergunta.type$': 'rating_0_10', ratingValue: { [Op.between]: [7, 8] } };
                break;
            case 'detratores':
                ratingWhere = { '$pergunta.type$': 'rating_0_10', ratingValue: { [Op.lte]: 6 } };
                break;
            case 'satisfeitos': // CSAT Satisfied
                ratingWhere = { '$pergunta.type$': 'rating_1_5', ratingValue: { [Op.gte]: 4 } };
                break;
            case 'neutros-csat': // CSAT Neutral
                ratingWhere = { '$pergunta.type$': 'rating_1_5', ratingValue: { [Op.eq]: 3 } };
                break;
            case 'insatisfeitos': // CSAT Unsatisfied
                ratingWhere = { '$pergunta.type$': 'rating_1_5', ratingValue: { [Op.lte]: 2 } };
                break;
            case 'cadastros':
                return await Client.findAll({ where: whereClause, order: [['createdAt', 'DESC']] });
            case 'cupons gerados':
                return await Cupom.findAll({ where: whereClause, include: [{ model: Client, as: 'client', attributes: ['name'] }], order: [['createdAt', 'DESC']] });
            case 'cupons utilizados':
                const usedWhere = { ...whereClause, status: 'used' };
                if (whereClause.createdAt) {
                    usedWhere.updatedAt = whereClause.createdAt;
                    delete usedWhere.createdAt;
                }
                return await Cupom.findAll({ where: usedWhere, include: [{ model: Client, as: 'client', attributes: ['name'] }], order: [['updatedAt', 'DESC']] });
            default:
                return [];
        }

        if (Object.keys(ratingWhere).length > 0) {
            return await Resposta.findAll({
                where: { ...whereClause, ...ratingWhere },
                include: [
                    { model: Client, as: 'client', attributes: ['name'] },
                    { model: Pergunta, as: 'pergunta', attributes: ['text', 'type'] }
                ],
                order: [['createdAt', 'DESC']],
            });
        }

        return [];
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
                    attributes: ['text', 'type']
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        const ratingResponses = responses.filter(r => r.ratingValue !== null && r.pergunta && r.pergunta.type.startsWith('rating'));

        const npsResult = ratingService.calculateNPS(ratingResponses);
        const csatResult = ratingService.calculateCSAT(ratingResponses);
        const attendant = await Atendente.findByPk(attendantId, { attributes: ['name'] });

        return {
            attendantName: attendant ? attendant.name : 'Desconhecido',
            nps: npsResult,
            csat: csatResult,
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
        const attendantsPerformance = await this.getAttendantsPerformanceWithGoals(tenantId);
        const criteriaScores = await this.getCriteriaScores(tenantId, startDate, endDate);
        const feedbacks = await this.getFeedbacks(tenantId, startDate, endDate);
        const conversionChart = await this.getConversionChart(tenantId, startDate, endDate);
        const npsByDayOfWeek = await this.getNpsByDayOfWeek(tenantId);
        const wordCloudData = await this.getWordCloudData(tenantId);

        return {
            summary,
            responseChart,
            attendantsPerformance,
            criteriaScores,
            feedbacks,
            conversionChart,
            npsByDayOfWeek,
            wordCloudData,
        };
    },
};

module.exports = dashboardRepository;