import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    TablePagination,
    Button
} from '@mui/material';
import franchisorService from '../services/franchisorService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const FranchiseesPage = () => {
    const [franchisees, setFranchisees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchFranchisees = async () => {
            try {
                setLoading(true);
                const data = await franchisorService.getFranchisees();
                setFranchisees(data);
            } catch (err) {
                setError(err.message || 'Falha ao carregar os franqueados.');
            } finally {
                setLoading(false);
            }
        };

        fetchFranchisees();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Container>
                <CircularProgress />
                <Alert severity="info">Carregando franqueados...</Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Meus Franqueados
                </Typography>
                <Button variant="contained" onClick={() => navigate('/franchisor/franchisees/new')}>
                    Novo Franqueado
                </Button>
            </Box>
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Telefone</TableCell>
                                <TableCell>Documento</TableCell>
                                <TableCell>Data de Criação</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {franchisees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((franchisee) => (
                                <TableRow key={franchisee.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/franchisor/franchisees/edit/${franchisee.id}`)}>
                                    <TableCell>{franchisee.name}</TableCell>
                                    <TableCell>{franchisee.email}</TableCell>
                                    <TableCell>{franchisee.phone}</TableCell>
                                    <TableCell>{franchisee.document}</TableCell>
                                    <TableCell>{format(new Date(franchisee.createdAt), 'dd/MM/yyyy')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={franchisees.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Container>
    );
};

export default FranchiseesPage;
