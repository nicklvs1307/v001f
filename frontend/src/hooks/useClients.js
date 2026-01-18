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
    
    // Estado para o valor do input, que atualiza imediatamente
    const [searchTerm, setSearchTerm] = useState(''); 
    // Estado para o filtro, que será aplicado com debounce
    const [filterText, setFilterText] = useState('');

    const fetchClients = useCallback(async () => {
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
    }, [page, rowsPerPage, orderBy, order, filterText]);

    // Efeito para aplicar o debounce
    useEffect(() => {
        const timerId = setTimeout(() => {
            setFilterText(searchTerm);
            setPage(0); // Resetar a página ao aplicar um novo filtro
        }, 500); // 500ms de delay

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]); // A dependência principal agora é a função de busca

    const createClient = async (clientData) => {
        try {
            const newClient = await clientService.createClient(clientData);
            fetchClients(); // Re-fetch para obter os dados mais recentes
            return newClient;
        } catch (err) {
            throw new Error(err.message || 'Falha ao criar cliente.');
        }
    };

    const updateClient = async (id, clientData) => {
        try {
            const updatedClient = await clientService.updateClient(id, clientData);
            fetchClients(); // Re-fetch para obter os dados mais recentes
            return updatedClient;
        } catch (err) {
            throw new Error(err.message || 'Falha ao atualizar cliente.');
        }
    };

    const deleteClient = async (id) => {
        try {
            await clientService.deleteClient(id);
            fetchClients(); // Re-fetch para obter os dados mais recentes
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

    // Atualiza o termo de busca imediatamente
    const handleFilterChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleClearFilter = () => {
        setSearchTerm('');
        setFilterText('');
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
        filterText: searchTerm, // Retorna o valor do input para ser exibido no TextField
        fetchClients, 
        createClient, 
        updateClient, 
        deleteClient,
        handleRequestSort,
        handleChangePage,
        handleChangeRowsPerPage,
        handleFilterChange,
        handleClearFilter
    };
};

export default useClients;
