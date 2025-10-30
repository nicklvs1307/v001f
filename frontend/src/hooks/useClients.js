
import { useState, useEffect, useCallback, useRef } from 'react';
import clientService from '../services/clientService';

// Utility debounce function
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

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

    const debouncedFetchClients = useCallback(
        debounce(async (page, rowsPerPage, orderBy, order, filterText) => {
            try {
                setLoading(true);
                const pageNumber = isNaN(page) ? 0 : page;
                const { clients: fetchedClients, total: fetchedTotal } = await clientService.getAllClients(pageNumber, rowsPerPage, orderBy, order, filterText);
                setClients(fetchedClients);
                setTotalClients(fetchedTotal);
                setError(null);
            } catch (err) {
                setError(err.message || 'Falha ao buscar clientes.');
            } finally {
                setLoading(false);
            }
        }, 500), // 500ms debounce delay
        []
    );

    useEffect(() => {
        debouncedFetchClients(page, rowsPerPage, orderBy, order, filterText);
    }, [page, rowsPerPage, orderBy, order, filterText, debouncedFetchClients]);

    const fetchClients = useCallback(() => {
        debouncedFetchClients(page, rowsPerPage, orderBy, order, filterText);
    }, [page, rowsPerPage, orderBy, order, filterText, debouncedFetchClients]);

    const createClient = async (clientData) => {
        try {
            const newClient = await clientService.createClient(clientData);
            debouncedFetchClients(page, rowsPerPage, orderBy, order, filterText); // Re-fetch to get the latest data
            return newClient;
        } catch (err) {
            throw new Error(err.message || 'Falha ao criar cliente.');
        }
    };

    const updateClient = async (id, clientData) => {
        try {
            const updatedClient = await clientService.updateClient(id, clientData);
            debouncedFetchClients(page, rowsPerPage, orderBy, order, filterText); // Re-fetch to get the latest data
            return updatedClient;
        } catch (err) {
            throw new Error(err.message || 'Falha ao atualizar cliente.');
        }
    };

    const deleteClient = async (id) => {
        try {
            await clientService.deleteClient(id);
            debouncedFetchClients(page, rowsPerPage, orderBy, order, filterText); // Re-fetch to get the latest data
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
