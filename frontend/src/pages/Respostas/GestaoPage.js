import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TablePagination,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { WhatsApp, Visibility, Lightbulb } from '@mui/icons-material';
import { subDays } from 'date-fns';
import PageLayout from '../../components/layout/PageLayout';
import dashboardService from '../../services/dashboardService';
import AuthContext from '../../context/AuthContext';
import { format } from 'date-fns';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const GestaoPage = () => {
    const { user } = useContext(AuthContext);
    const query = useQuery();
    const [feedbacks, setFeedbacks] = useState([]);
    const [totalFeedbacks, setTotalFeedbacks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState(new Date());
    const [npsClassification, setNpsClassification] = useState(query.get('npsClassification') || 'all');

    const fetchFeedbacks = useCallback(async () => {
        if (!user?.tenantId) return;

        try {
            setLoading(true);
            const params = { 
                tenantId: user.tenantId, 
                page: page + 1, 
                limit: rowsPerPage,
                startDate: getStartOfDayUTC(startDate),
                endDate: getEndOfDayUTC(endDate),
                npsClassification,
            };
            const data = await dashboardService.getAllFeedbacks(params);
            
            setFeedbacks(data.rows || []);
            setTotalFeedbacks(data.count || 0);

        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
        } finally {
            setLoading(false);
        }
    }, [user, page, rowsPerPage, startDate, endDate, npsClassification]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClassificationChange = (event) => {
        setNpsClassification(event.target.value);
        setPage(0);
    };

    const filters = (
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel>Classificação</InputLabel>
            <Select
                value={npsClassification}
                onChange={handleClassificationChange}
                label="Classificação"
            >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="promoters">Promotores</MenuItem>
                <MenuItem value="neutrals">Neutros</MenuItem>
                <MenuItem value="detractors">Detratores</MenuItem>
            </Select>
        </FormControl>
    );

    return (
        <PageLayout
            title="Gestão de Respostas"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            headerChildren={filters}
        >
            {loading ? (
                <Typography>Carregando...</Typography>
            ) : (
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Horário</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>NPS</TableCell>
                                    <TableCell>Sugestão</TableCell>
                                    <TableCell>Último Contato</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feedbacks.map((feedback) => (
                                    <TableRow key={feedback.id}>
                                        <TableCell>{feedback.createdAt ? format(new Date(feedback.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}</TableCell>
                                        <TableCell>{feedback.client?.name || 'N/A'}</TableCell>
                                        <TableCell>{feedback.npsScore}</TableCell>
                                        <TableCell>{feedback.comment}</TableCell>
                                        <TableCell>{feedback.lastContact ? format(new Date(feedback.lastContact), 'dd/MM/yyyy HH:mm') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Enviar WhatsApp">
                                                <IconButton color="primary">
                                                    <WhatsApp />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Insight">
                                                <IconButton color="secondary">
                                                    <Lightbulb />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Visualizar">
                                                <IconButton>
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={totalFeedbacks}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}
        </PageLayout>
    );
};

export default GestaoPage;