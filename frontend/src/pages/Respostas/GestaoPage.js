import React, { useEffect, useState, useContext, useCallback } from 'react';
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
} from '@mui/material';
import { WhatsApp, Visibility, Lightbulb } from '@mui/icons-material';
import { subDays } from 'date-fns';
import PageLayout from '../../components/layout/PageLayout';
import dashboardService from '../../services/dashboardService';
import AuthContext from '../../context/AuthContext';
import { format } from 'date-fns';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';

const GestaoPage = () => {
    const { user } = useContext(AuthContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [totalFeedbacks, setTotalFeedbacks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState(new Date());

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
            };
            const data = await dashboardService.getAllFeedbacks(params);
            
            setFeedbacks(data.rows || []);
            setTotalFeedbacks(data.count || 0);

        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
        } finally {
            setLoading(false);
        }
    }, [user, page, rowsPerPage, startDate, endDate]);

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

    return (
        <PageLayout
            title="Gestão de Respostas"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
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