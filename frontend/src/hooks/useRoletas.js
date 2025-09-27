import { useState, useEffect } from 'react';
import roletaService from '../services/roletaService';

const useRoletas = () => {
    const [roletas, setRoletas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoletas = async () => {
            try {
                setLoading(true);
                const data = await roletaService.getAllRoletas();
                setRoletas(data.roletas);
                setError(null);
            } catch (err) {
                setError(err.message || 'Falha ao carregar roletas.');
            } finally {
                setLoading(false);
            }
        };

        fetchRoletas();
    }, []);

    return { roletas, loading, error };
};

export default useRoletas;
