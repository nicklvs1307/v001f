
import { useState, useEffect } from 'react';
import criterioService from '../services/criterioService';

const useCriterios = () => {
    const [criterios, setCriterios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCriterios = async () => {
            try {
                setLoading(true);
                const data = await criterioService.getAllCriterios();
                setCriterios(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Falha ao carregar critérios.');
            } finally {
                setLoading(false);
            }
        };

        fetchCriterios();
    }, []);

    return { criterios, loading, error };
};

export default useCriterios;
