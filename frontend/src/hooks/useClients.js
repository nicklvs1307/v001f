
import { useState, useEffect, useCallback } from 'react';
import clientService from '../services/clientService';

const useClients = () => {
    const [clients, setClients] = useState([]);
    const [totalClients, setTotalClients] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('name');
    const [order, setOrder] = useState('asc');
    const [filterText, setFilterText] = useState('');

    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            const { clients: fetchedClients, total: fetchedTotal } = await clientService.getAllClients(page, rowsPerPage, orderBy, order, filterText);
            setClients(fetchedClients);
            setTotalClients(fetchedTotal);
            setError(null);
        } catch (err) {
            setError(err.message || 'Falha ao buscar clientes.');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, orderBy, order, filterText]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const createClient = async (clientData) => {
        try {
            const newClient = await clientService.createClient(clientData);
            fetchClients(); // Re-fetch to get the latest data
            return newClient;
        } catch (err) {
            throw new Error(err.message || 'Falha ao criar cliente.');
        }
    };

    const updateClient = async (id, clientData) => {
        try {
            const updatedClient = await clientService.updateClient(id, clientData);
            fetchClients(); // Re-fetch to get the latest data
            return updatedClient;
        } catch (err) {
            throw new Error(err.message || 'Falha ao atualizar cliente.');
        }
    };

    const deleteClient = async (id) => {
        try {
            await clientService.deleteClient(id);
            fetchClients(); // Re-fetch to get the latest data
        } catch (err) {
            throw new Error(err.message || 'Falha ao deletar cliente.');
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
        setPage(0);
    };

    return { 
        clients, 
        totalClients,
        loading, 
        error, 
        page, 
        rowsPerPage, 
        orderBy, 
        order, 
        filterText, 
        fetchClients, 
        createClient, 
        updateClient, 
        deleteClient,
        handleRequestSort,
        handleChangePage,
        handleChangeRowsPerPage,
        handleFilterChange
    };
};

export default useClients;
