import { useState, useEffect } from 'react';
import recompensaService from '../services/recompensaService';

const useRecompensas = () => {
    const [recompensas, setRecompensas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecompensas = async () => {
            try {
                setLoading(true);
                const data = await recompensaService.getAllRecompensas();
                setRecompensas(data.recompensas);
                setError(null);
            } catch (err) {
                setError(err.message || 'Falha ao carregar recompensas.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecompensas();
    }, []);

    return { recompensas, loading, error };
};

export default useRecompensas;
