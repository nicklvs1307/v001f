
import React, { useContext, useState, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    TextField,
} from '@mui/material';
import AuthContext from '../context/AuthContext';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { getStartOfDayUTC, getEndOfDayUTC } from '../utils/dateUtils';

import dashboardService from '../services/dashboardService';
import DetailsModal from '../components/Dashboard/DetailsModal';
import AttendantDetailsModal from '../components/Dashboard/AttendantDetailsModal';
import SummaryMetrics from '../components/Dashboard/SummaryMetrics';
import ResponseCharts from '../components/Dashboard/ResponseCharts';
import AttendantPerformance from '../components/Dashboard/AttendantPerformance';
import CriteriaChart from '../components/Dashboard/CriteriaChart';
import RecentFeedbacks from '../components/Dashboard/RecentFeedbacks';
import NpsTrendChart from '../components/Dashboard/NpsTrendChart';
import ConversionChart from '../components/Dashboard/ConversionChart';



const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: 4,
    flexWrap: 'wrap',
    gap: 2,
};

const welcomeStyles = {
    display: 'flex',
    flexDirection: 'column',
};

const dateFilterStyles = {
    display: 'flex',
    gap: 2,
    alignItems: 'center',
    flexWrap: 'wrap',
};

const sectionTitleStyles = {
    mb: 3,
};

const DashboardPage = () => {
    const { user } = useContext(AuthContext);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    const [attendantModalOpen, setAttendantModalOpen] = useState(false);
    const [attendantModalData, setAttendantModalData] = useState(null);
    const [attendantModalLoading, setAttendantModalLoading] = useState(false);
    const [attendantModalError, setAttendantModalError] = useState('');

    const handleCardClick = useCallback(async (category, title) => {
        setModalTitle(title || `Detalhes de ${category}`);
        setModalOpen(true);
        setModalLoading(true);
        try {
            const params = {};
            if (startDate) params.startDate = getStartOfDayUTC(startDate);
            if (endDate) params.endDate = getEndOfDayUTC(endDate);
            const data = await dashboardService.getDetails(category, params);
            setModalData(data);
        } catch (err) {
            setModalError(err.message || 'Falha ao carregar os detalhes.');
        } finally {
            setModalLoading(false);
        }
    }, [startDate, endDate]);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setModalTitle('');
        setModalData([]);
        setModalError('');
    }, []);

    const handleAttendantClick = useCallback(async (attendantId) => {
        setAttendantModalOpen(true);
        setAttendantModalLoading(true);
        try {
            const params = {};
            if (startDate) params.startDate = getStartOfDayUTC(startDate);
            if (endDate) params.endDate = getEndOfDayUTC(endDate);
            const data = await dashboardService.getAttendantDetails(attendantId, params);
            setAttendantModalData(data);
        } catch (err) {
            setAttendantModalError(err.message || 'Falha ao carregar os detalhes do atendente.');
        } finally {
            setAttendantModalLoading(false);
        }
    }, [startDate, endDate]);

    const handleFeedbackClick = useCallback(async (sessionId) => {
        setModalTitle('Detalhes da Resposta');
        setModalOpen(true);
        setModalLoading(true);
        try {
            const data = await dashboardService.getResponseDetails(sessionId);
            setModalData(data);
        } catch (err) {
            setModalError(err.message || 'Falha ao carregar os detalhes da resposta.');
        } finally {
            setModalLoading(false);
        }
    }, []);

    const handleCloseAttendantModal = useCallback(() => {
        setAttendantModalOpen(false);
        setAttendantModalData(null);
        setAttendantModalError('');
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={headerStyles}>
                <Box sx={welcomeStyles}>
                    <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">
                        Olá, {user?.name || 'Usuário'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        Veja o que está acontecendo com seus clientes
                    </Typography>
                </Box>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <Box sx={dateFilterStyles}>
                        <DatePicker
                            label="Data de Início"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <Typography variant="body2" color="text.secondary">até</Typography>
                        <DatePicker
                            label="Data de Fim"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </Box>
                </LocalizationProvider>
            </Box>

            <SummaryMetrics startDate={startDate} endDate={endDate} handleCardClick={handleCardClick} />

            <DetailsModal
                open={modalOpen}
                handleClose={handleCloseModal}
                title={modalTitle}
                data={modalData}
                loading={modalLoading}
                error={modalError}
            />

            <AttendantDetailsModal
                open={attendantModalOpen}
                handleClose={handleCloseAttendantModal}
                data={attendantModalData}
                loading={attendantModalLoading}
                error={attendantModalError}
            />

            <Box sx={sectionTitleStyles}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                    Visão Geral
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Respostas e pesquisas por período
                </Typography>
            </Box>
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <ResponseCharts startDate={startDate} endDate={endDate} />
            </Grid>

            <Box sx={sectionTitleStyles}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                    Análise de Desempenho
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Tendência de NPS e scores por critério
                </Typography>
            </Box>
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <NpsTrendChart startDate={startDate} endDate={endDate} />
                <CriteriaChart startDate={startDate} endDate={endDate} />
            </Grid>

            <Box sx={sectionTitleStyles}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                    Equipe e Feedbacks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Performance dos atendentes e feedbacks recentes
                </Typography>
            </Box>
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <AttendantPerformance
                    startDate={startDate}
                    endDate={endDate}
                    handleAttendantClick={handleAttendantClick}
                />
                <RecentFeedbacks
                    startDate={startDate}
                    endDate={endDate}
                    handleFeedbackClick={handleFeedbackClick}
                />
            </Grid>

            <Box sx={sectionTitleStyles}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                    Conversão
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Análise do funil de conversão
                </Typography>
            </Box>
            <ConversionChart startDate={startDate} endDate={endDate} handleCardClick={handleCardClick} />
        </Container>
    );
};

export default DashboardPage;
