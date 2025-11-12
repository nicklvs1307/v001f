const { Pesquisa, Resposta, Usuario, Tenant, Pergunta, Cupom, Atendente, AtendenteMeta, Client, Criterio } = require('../../models');
const { Sequelize, Op } = require('sequelize');
const ratingService = require('../services/ratingService');

const { fn, col, literal } = Sequelize;

const { PorterStemmerPt } = require('natural');
const stopwords = require('../utils/stopwords');

const dashboardRepository = {
    getSummary: async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
        const dateFilter = {};
        if (startDate) {
            dateFilter[Op.gte] = startDate;
        }
        if (endDate) {
            dateFilter[Op.lte] = endDate;
        }
    
        const ratingResponsesWhere = {
            ratingValue: { [Op.ne]: null }
        };
        if (tenantId) {
            ratingResponsesWhere.tenantId = tenantId;
        }
        if (surveyId) {
            ratingResponsesWhere.pesquisaId = surveyId;
        }
        if (startDate || endDate) {
            ratingResponsesWhere.createdAt = dateFilter;
        }
    
        const ratingResponses = await Resposta.findAll({
            where: ratingResponsesWhere,
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
        
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const ambassadorsMonth = npsResponses.filter(r => {
                    const responseDate = new Date(r.createdAt);
                    return responseDate.getMonth() === currentMonth && responseDate.getFullYear() === currentYear && r.ratingValue >= 9;
                }).length;
        
        const totalResponsesWhere = {            respondentSessionId: { [Op.ne]: null }
        };
        if (tenantId) {
            totalResponsesWhere.tenantId = tenantId;
        }
        if (surveyId) {
            totalResponsesWhere.pesquisaId = surveyId;
        }
        if (startDate || endDate) {
            totalResponsesWhere.createdAt = dateFilter;
        }
        const totalResponses = await Resposta.count({ where: totalResponsesWhere, distinct: true, col: 'respondentSessionId' });
        
        const clientWhereClause = tenantId ? { tenantId } : {};
        if (surveyId) {
            // This might not be what you want - it counts all clients, not just those who responded to the survey
        }
        if (startDate || endDate) {
            clientWhereClause.createdAt = dateFilter;
        }
        const totalUsers = await Client.count({ where: clientWhereClause });
    
        const couponsGeneratedWhere = tenantId ? { tenantId } : {};
        if (surveyId) {
            couponsGeneratedWhere.pesquisaId = surveyId;
        }
        if (startDate || endDate) {
            couponsGeneratedWhere.createdAt = dateFilter;
        }
        const couponsGenerated = await Cupom.count({ where: couponsGeneratedWhere });
    
        const couponsUsedWhere = { status: 'used' };
        if (tenantId) {
            couponsUsedWhere.tenantId = tenantId;
        }
        if (surveyId) {
            couponsUsedWhere.pesquisaId = surveyId;
        }
        if (startDate || endDate) {
            const dateFilterForUpdatedAt = {};
            if (startDate) dateFilterForUpdatedAt[Op.gte] = startDate;
            if (endDate) dateFilterForUpdatedAt[Op.lte] = endDate;
            couponsUsedWhere.updatedAt = dateFilterForUpdatedAt;
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
            ambassadorsMonth,
            couponsGeneratedPeriod: startDate && endDate ? `de ${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}` : 'Desde o início',
        };
    },

    getResponseChart: async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }
    
        // Default to last 7 days if no dates are provided
        if (!startDate || !endDate) {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 6);
        } else {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
        }
    
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
        let period = 'day';
        if (diffDays > 90) {
            period = 'month';
        } else if (diffDays > 31) {
            period = 'week';
        }
    
        whereClause.createdAt = {
            [Op.gte]: startDate,
            [Op.lte]: endDate
        };
    
        const responsesByPeriod = await Resposta.findAll({
            where: whereClause,
            attributes: [
                [fn('date_trunc', period, col('createdAt')), 'period'],
                [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'count']
            ],
            group: [fn('date_trunc', period, col('createdAt'))],
            order: [[fn('date_trunc', period, col('createdAt')), 'ASC']]
        });
    
        const chartData = [];
        const dataMap = new Map(responsesByPeriod.map(item => [
            new Date(item.dataValues.period).toISOString().split('T')[0],
            parseInt(item.dataValues.count)
        ]));
    
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const formattedDate = currentDate.toISOString().split('T')[0];
            let name;
            
            if (period === 'day') {
                name = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                chartData.push({
                    name,
                    Respostas: dataMap.get(formattedDate) || 0,
                });
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (period === 'week') {
                const weekStart = new Date(currentDate);
                const weekEnd = new Date(currentDate);
                weekEnd.setDate(weekEnd.getDate() + 6);
                name = `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
                
                // Find the truncated week start date from the map
                const weekStartDateInDB = [...dataMap.keys()].find(key => {
                    const dbDate = new Date(key);
                    return dbDate >= weekStart && dbDate <= weekEnd;
                });

                chartData.push({
                    name,
                    Respostas: dataMap.get(weekStartDateInDB) || 0,
                });
                currentDate.setDate(currentDate.getDate() + 7);
            } else { // month
                const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                name = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                
                const monthStartDateInDB = [...dataMap.keys()].find(key => {
                    const dbDate = new Date(key);
                    return dbDate.getFullYear() === monthStart.getFullYear() && dbDate.getMonth() === monthStart.getMonth();
                });

                chartData.push({
                    name,
                    Respostas: dataMap.get(monthStartDateInDB) || 0,
                });
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
    
        return chartData;
    },

    getRanking: async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }
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

    getCriteriaScores: async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
        const responseWhereClause = { ratingValue: { [Op.ne]: null } };
        if (tenantId) {
            responseWhereClause.tenantId = tenantId;
        }
        if (surveyId) {
            responseWhereClause.pesquisaId = surveyId;
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

    getFeedbacks: async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: '' } } : { textValue: { [Op.ne]: null, [Op.ne]: '' } };
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }
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

    getConversionChart: async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }
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
        const couponsGenerated = await Cupom.count({ where: whereClause });

        const couponsUsedWhere = { status: 'used' };
        if (tenantId) couponsUsedWhere.tenantId = tenantId;
        if (Object.keys(dateFilter).length > 0) {
            couponsUsedWhere.updatedAt = dateFilter;
        }
        const couponsUsed = await Cupom.count({ where: couponsUsedWhere });

        return [
            { name: 'Respostas', value: totalResponses },
            { name: 'Cadastros', value: totalUsers },
            { name: 'Cupons Gerados', value: couponsGenerated },
            { name: 'Cupons Utilizados', value: couponsUsed },
        ];
    },

    getOverallResults: async function (tenantId = null, startDate = null, endDate = null, surveyId = null) {
        const whereClause = tenantId ? { tenantId } : {};
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

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
                const questionType = response.pergunta.type.startsWith('rating_0_10') ? 'NPS' : 'CSAT'; // Determine type from question
                
                const key = `${criteriaName}|${questionType}`;

                if (!acc[key]) {
                    acc[key] = {
                        criterion: criteriaName,
                        responses: [],
                        type: questionType
                    };
                }
                acc[key].responses.push(response);
            }
            return acc;
        }, {});

        const scoresByCriteria = Object.values(responsesByCriteria).map((data) => {
            const { responses, type, criterion } = data;
            if (type === 'NPS') {
                const npsResult = ratingService.calculateNPS(responses);
                return { criterion, scoreType: 'NPS', ...npsResult };
            } else if (type === 'CSAT') {
                const csatResult = ratingService.calculateCSAT(responses);
                return { criterion, scoreType: 'CSAT', ...csatResult };
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

    getWordCloudData: async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId, textValue: { [Op.ne]: null, [Op.ne]: '' } } : { textValue: { [Op.ne]: null, [Op.ne]: '' } };
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }

        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

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
            }],
            limit: 2000,
        });

        const text = feedbacks.map(f => f.textValue).join(' ');
        const words = text.toLowerCase().replace(/[.,!?;:"'()]/g, '').split(/\s+/);

        const frequencies = {};
        for (const word of words) {
            const stemmedWord = PorterStemmerPt.stem(word);
            if (stemmedWord && stemmedWord.length > 2 && !stopwords.has(word) && !stopwords.has(stemmedWord)) {
                frequencies[stemmedWord] = (frequencies[stemmedWord] || 0) + 1;
            }
        }

        return Object.entries(frequencies)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 100);
    },

        getNpsTrendData: async (tenantId = null, period = 'day', startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId, ratingValue: { [Op.ne]: null } } : { ratingValue: { [Op.ne]: null } };
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }

        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

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
                [fn('date_trunc', period, col('createdAt')), 'period'],
                [fn('SUM', literal('CASE WHEN "ratingValue" >= 9 THEN 1 ELSE 0 END')), 'promoters'],
                [fn('SUM', literal('CASE WHEN "ratingValue" <= 6 THEN 1 ELSE 0 END')), 'detractors'],
                [fn('COUNT', col('id')), 'total']
            ],
            group: [fn('date_trunc', period, col('createdAt'))],
            order: [[fn('date_trunc', period, col('createdAt')), 'ASC']]
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

    getCsatTrendData: async (tenantId = null, period = 'day', startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId, ratingValue: { [Op.ne]: null } } : { ratingValue: { [Op.ne]: null } };
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }

        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const trendData = await Resposta.findAll({
            where: whereClause,
            include: [{
                model: Pergunta,
                as: 'pergunta',
                attributes: [],
                where: {
                    type: 'rating_1_5'
                },
                required: true
            }],
            attributes: [
                [fn('date_trunc', period, col('createdAt')), 'period'],
                [fn('SUM', literal('CASE WHEN "ratingValue" >= 4 THEN 1 ELSE 0 END')), 'satisfied'],
                [fn('COUNT', col('id')), 'total']
            ],
            group: [fn('date_trunc', period, col('createdAt'))],
            order: [[fn('date_trunc', period, col('createdAt')), 'ASC']]
        });

        return trendData.map(item => {
            const data = item.dataValues;
            const satisfied = parseInt(data.satisfied) || 0;
            const total = parseInt(data.total) || 0;
            let satisfactionRate = 0;
            if (total > 0) {
                satisfactionRate = (satisfied / total) * 100;
            }
            return {
                period: new Date(data.period).toLocaleDateString('pt-BR'),
                satisfaction: parseFloat(satisfactionRate.toFixed(1)),
            };
        });
    },

    getResponseCountTrendData: async (tenantId = null, period = 'day', startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }

        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const trendData = await Resposta.findAll({
            where: whereClause,
            attributes: [
                [fn('date_trunc', period, col('createdAt')), 'period'],
                [fn('COUNT', fn('DISTINCT', col('respondentSessionId'))), 'count']
            ],
            group: [fn('date_trunc', period, col('createdAt'))],
            order: [[fn('date_trunc', period, col('createdAt')), 'ASC']]
        });

        return trendData.map(item => ({
            period: new Date(item.dataValues.period).toLocaleDateString('pt-BR'),
            responses: parseInt(item.dataValues.count),
        }));
    },

    getRegistrationTrendData: async (tenantId = null, period = 'day', startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        // surveyId is not directly applicable to Client model, so we might need a more complex query if we want to filter by survey
        
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const trendData = await Client.findAll({
            where: whereClause,
            attributes: [
                [fn('date_trunc', period, col('createdAt')), 'period'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: [fn('date_trunc', period, col('createdAt'))],
            order: [[fn('date_trunc', period, col('createdAt')), 'ASC']]
        });

        return trendData.map(item => ({
            period: new Date(item.dataValues.period).toLocaleDateString('pt-BR'),
            registrations: parseInt(item.dataValues.count),
        }));
    },

    getEvolutionDashboard: async function (tenantId = null, period = 'day', startDate = null, endDate = null) {
        const npsTrend = await this.getNpsTrendData(tenantId, period, startDate, endDate);
        const csatTrend = await this.getCsatTrendData(tenantId, period, startDate, endDate);
        const responseCountTrend = await this.getResponseCountTrendData(tenantId, period, startDate, endDate);
        const registrationTrend = await this.getRegistrationTrendData(tenantId, period, startDate, endDate);

        // Combine data into a single structure
        const evolutionData = {};

        const processTrend = (trend, key) => {
            trend.forEach(item => {
                if (!evolutionData[item.period]) {
                    evolutionData[item.period] = { period: item.period };
                }
                evolutionData[item.period][key] = item[key];
            });
        };

        processTrend(npsTrend, 'nps');
        processTrend(csatTrend, 'satisfaction');
        processTrend(responseCountTrend, 'responses');
        processTrend(registrationTrend, 'registrations');

        return Object.values(evolutionData).sort((a, b) => new Date(a.period.split('/').reverse().join('-')) - new Date(b.period.split('/').reverse().join('-')));
    },

    getNpsByDayOfWeek: async (tenantId = null, startDate = null, endDate = null, surveyId = null) => {
        const whereClause = tenantId ? { tenantId, ratingValue: { [Op.ne]: null } } : { ratingValue: { [Op.ne]: null } };
        if (surveyId) {
            whereClause.pesquisaId = surveyId;
        }
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

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
    getAttendantsPerformanceWithGoals: async (tenantId = null, startDate = null, endDate = null) => {
        const whereClause = tenantId ? { tenantId } : {};

        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = startDate;
        if (endDate) dateFilter[Op.lte] = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

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

    getMonthSummary: async (tenantId = null, startDate = null, endDate = null) => {
        const whereClause = tenantId ? { tenantId } : {};
        const dateFilter = {};
        if (startDate) dateFilter[Op.gte] = new Date(startDate);
        if (endDate) dateFilter[Op.lte] = new Date(endDate);

        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const npsResponses = await Resposta.findAll({
            where: {
                ...whereClause,
                ratingValue: { [Op.ne]: null }
            },
            include: [{
                model: Pergunta,
                as: 'pergunta',
                attributes: ['type'],
                where: { type: 'rating_0_10' },
                required: true
            }, {
                model: Client,
                as: 'client',
                attributes: ['id'] // We only need to check for its existence
            }],
            attributes: ['id', 'ratingValue', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        // 1. Daily distribution and NPS
        const dailyData = {};
        let accumulatedPromoters = 0;
        let accumulatedNeutrals = 0;
        let accumulatedDetractors = 0;
        let accumulatedTotal = 0;

        npsResponses.forEach(response => {
            const day = response.createdAt.toISOString().split('T')[0];
            if (!dailyData[day]) {
                dailyData[day] = { promoters: 0, neutrals: 0, detractors: 0, total: 0 };
            }

            const classification = ratingService.classifyNPS(response.ratingValue);
            if (classification) {
                dailyData[day][`${classification}s`]++;
                dailyData[day].total++;
            }
        });

        const dailyNps = Object.keys(dailyData).map(day => {
            const dayData = dailyData[day];
            const totalDaily = dayData.total;
            const npsScore = totalDaily > 0 ? ((dayData.promoters / totalDaily) * 100) - ((dayData.detractors / totalDaily) * 100) : 0;
            
            accumulatedPromoters += dayData.promoters;
            accumulatedNeutrals += dayData.neutrals;
            accumulatedDetractors += dayData.detractors;
            accumulatedTotal += dayData.total;
            
            const accumulatedNps = accumulatedTotal > 0 ? ((accumulatedPromoters / accumulatedTotal) * 100) - ((accumulatedDetractors / accumulatedTotal) * 100) : 0;

            return {
                date: day,
                promoters: dayData.promoters,
                neutrals: dayData.neutrals,
                detractors: dayData.detractors,
                nps: parseFloat(npsScore.toFixed(1)),
                accumulatedNps: parseFloat(accumulatedNps.toFixed(1))
            };
        });

        // 2. Peak response times
        const responsesByHour = await Resposta.findAll({
            where: whereClause,
            attributes: [
                [fn('EXTRACT', literal('HOUR FROM "createdAt"')), 'hour'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: [fn('EXTRACT', literal('HOUR FROM "createdAt"'))],
            order: [[fn('EXTRACT', literal('HOUR FROM "createdAt"')), 'ASC']]
        });
        
        const peakHours = responsesByHour.map(item => ({
            hour: parseInt(item.dataValues.hour),
            count: parseInt(item.dataValues.count)
        }));

        // 3. Distribution by day of the week
        const responsesByWeekday = await Resposta.findAll({
            where: whereClause,
            attributes: [
                [fn('EXTRACT', literal('ISODOW FROM "createdAt"')), 'weekday'], // 1=Monday, 7=Sunday
                [fn('COUNT', col('id')), 'count']
            ],
            group: [fn('EXTRACT', literal('ISODOW FROM "createdAt"'))],
            order: [[fn('EXTRACT', literal('ISODOW FROM "createdAt"')), 'ASC']]
        });

        const weekdays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        const weekdayDistribution = responsesByWeekday.map(item => ({
            day: weekdays[parseInt(item.dataValues.weekday) - 1],
            count: parseInt(item.dataValues.count)
        }));

        // 4. Total responses
        const totalResponses = await Resposta.count({ where: whereClause });

        // 5. Registered vs. Unregistered
        const registeredResponses = npsResponses.filter(r => r.client).length;
        const unregisteredResponses = npsResponses.length - registeredResponses;
        const clientProportion = {
            registered: registeredResponses,
            unregistered: unregisteredResponses,
            total: npsResponses.length
        };

        return {
            dailyNps,
            peakHours,
            weekdayDistribution,
            totalResponses,
            clientProportion
        };
    },

    getMainDashboard: async function (tenantId = null, startDate = null, endDate = null, surveyId = null) {
        // Ensure startDate and endDate are Date objects for calculations
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        let npsTrendPeriod = 'day';
        if (start && end) {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 90) {
                npsTrendPeriod = 'month';
            } else if (diffDays > 31) {
                npsTrendPeriod = 'week';
            }
        }

        const summary = await this.getSummary(tenantId, startDate, endDate, surveyId);
        const responseChart = await this.getResponseChart(tenantId, startDate, endDate, surveyId);
        const attendantsPerformance = await this.getAttendantsPerformanceWithGoals(tenantId, startDate, endDate, surveyId);
        const criteriaScores = await this.getCriteriaScores(tenantId, startDate, endDate, surveyId);
        const feedbacks = await this.getFeedbacks(tenantId, startDate, endDate, surveyId);
        const conversionChart = await this.getConversionChart(tenantId, startDate, endDate, surveyId);
        const npsByDayOfWeek = await this.getNpsByDayOfWeek(tenantId, startDate, endDate, surveyId);
        const npsTrend = await this.getNpsTrendData(tenantId, npsTrendPeriod, startDate, endDate, surveyId);
        const overallResults = await this.getOverallResults(tenantId, startDate, endDate, surveyId);


        return {
            summary,
            responseChart,
            attendantsPerformance,
            criteriaScores,
            feedbacks,
            conversionChart,
            npsByDayOfWeek,
            npsTrend,
            overallResults,
        };
    },
};

module.exports = dashboardRepository;