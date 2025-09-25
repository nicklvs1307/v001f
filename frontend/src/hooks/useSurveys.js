
import { useState, useEffect, useCallback } from 'react';
import surveyService from '../services/surveyService';

const useSurveys = () => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSurveys = useCallback(async () => {
        try {
            setLoading(true);
            const data = await surveyService.getAllSurveys();
            setSurveys(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Falha ao buscar pesquisas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSurveys();
    }, [fetchSurveys]);

    const createSurvey = async (surveyData) => {
        try {
            const newSurvey = await surveyService.createSurvey(surveyData);
            setSurveys((prevSurveys) => [...prevSurveys, newSurvey.survey]);
            return newSurvey;
        } catch (err) {
            throw new Error(err.message || 'Falha ao criar pesquisa.');
        }
    };

    const updateSurvey = async (id, surveyData) => {
        try {
            const updatedSurvey = await surveyService.updateSurvey(id, surveyData);
            setSurveys((prevSurveys) =>
                prevSurveys.map((survey) =>
                    survey.id === updatedSurvey.survey.id ? updatedSurvey.survey : survey
                )
            );
            return updatedSurvey;
        } catch (err) {
            throw new Error(err.message || 'Falha ao atualizar pesquisa.');
        }
    };

    const deleteSurvey = async (id) => {
        try {
            await surveyService.deleteSurvey(id);
            setSurveys((prevSurveys) => prevSurveys.filter((survey) => survey.id !== id));
        } catch (err) {
            throw new Error(err.message || 'Falha ao deletar pesquisa.');
        }
    };

    return { surveys, loading, error, fetchSurveys, createSurvey, updateSurvey, deleteSurvey };
};

export default useSurveys;
