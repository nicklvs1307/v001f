
import { useState, useEffect, useCallback } from 'react';
import atendenteService from '../services/atendenteService';

const useAtendentes = () => {
    const [atendentes, setAtendentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAtendentes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await atendenteService.getAllAtendentes();
            setAtendentes(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Falha ao buscar atendentes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAtendentes();
    }, [fetchAtendentes]);

    const createAtendente = async (atendenteData) => {
        try {
            const newAtendente = await atendenteService.createAtendente(atendenteData);
            fetchAtendentes();
            return newAtendente;
        } catch (err) {
            throw new Error(err.message || 'Falha ao criar atendente.');
        }
    };

    const updateAtendente = async (id, atendenteData) => {
        try {
            const updatedAtendente = await atendenteService.updateAtendente(id, atendenteData);
            fetchAtendentes();
            return updatedAtendente;
        } catch (err) {
            throw new Error(err.message || 'Falha ao atualizar atendente.');
        }
    };

    const deleteAtendente = async (id) => {
        try {
            await atendenteService.deleteAtendente(id);
            fetchAtendentes();
        } catch (err) {
            throw new Error(err.message || 'Falha ao deletar atendente.');
        }
    };

    return { atendentes, loading, error, fetchAtendentes, createAtendente, updateAtendente, deleteAtendente };
};

export default useAtendentes;
