
import React, { useContext, useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    IconButton,
    useTheme,
    CircularProgress,
    Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AuthContext from '../context/AuthContext';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { formatDateForDisplay, getStartOfDayUTC, getEndOfDayUTC } from '../utils/dateUtils';

import dashboardService from '../services/dashboardService';
import DetailsModal from '../components/Dashboard/DetailsModal';
import AttendantDetailsModal from '../components/Dashboard/AttendantDetailsModal';
import ChartCard from '../components/charts/ChartCard';
import DashboardSummaryMetricCard from '../components/Dashboard/DashboardSummaryMetricCard'; // Importa o DashboardSummaryMetricCard
import SummaryMetrics from '../components/Dashboard/SummaryMetrics'; // Importa o SummaryMetrics
import ResponseCharts from '../components/Dashboard/ResponseCharts'; // Importa o ResponseCharts
import AttendantPerformance from '../components/Dashboard/AttendantPerformance'; // Importa o AttendantPerformance
import CriteriaChart from '../components/Dashboard/CriteriaChart'; // Importa o CriteriaChart
import RecentFeedbacks from '../components/Dashboard/RecentFeedbacks'; // Importa o RecentFeedbacks
import NpsTrendChart from '../components/Dashboard/NpsTrendChart'; // Importa o NpsTrendChart
import ConversionChart from '../components/Dashboard/ConversionChart'; // Importa o ConversionChart



const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // State for the details modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    // State for the attendant details modal
    const [attendantModalOpen, setAttendantModalOpen] = useState(false);
    const [attendantModalData, setAttendantModalData] = useState(null);
    const [attendantModalLoading, setAttendantModalLoading] = useState(false);
    const [attendantModalError, setAttendantModalError] = useState('');
    const [attendantSearch, setAttendantSearch] = useState('');

    const handleCardClick = async (category, title) => {
        setModalTitle(title || `Detalhes de ${category}`);
        setModalOpen(true);
        setModalLoading(true);
        try {
            const params = {};
            if (startDate) {
                params.startDate = getStartOfDayUTC(startDate);
            }
            if (endDate) {
                params.endDate = getEndOfDayUTC(endDate);
            }
            const data = await dashboardService.getDetails(category, params);
            setModalData(data);
        } catch (err) {
            setModalError(err.message || 'Falha ao carregar os detalhes.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalTitle('');
        setModalData([]);
        setModalError('');
    };

    const handleAttendantClick = async (attendantId) => {
        setAttendantModalOpen(true);
        setAttendantModalLoading(true);
        try {
            const params = {};
            if (startDate) {
                params.startDate = getStartOfDayUTC(startDate);
            }
            if (endDate) {
                params.endDate = getEndOfDayUTC(endDate);
            }
            const data = await dashboardService.getAttendantDetails(attendantId, params);
            setAttendantModalData(data);
        } catch (err) {
            setAttendantModalError(err.message || 'Falha ao carregar os detalhes do atendente.');
        } finally {
            setAttendantModalLoading(false);
        }
    };

    const handleFeedbackClick = async (sessionId) => {
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
    };

    const handleCloseAttendantModal = () => {
        setAttendantModalOpen(false);
        setAttendantModalData(null);
        setAttendantModalError('');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard de Análise
                </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <DatePicker
                                label="Data de Início"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                renderInput={(params) => <TextField {...params} />}
                            />
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

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <ResponseCharts startDate={startDate} endDate={endDate} />
            </Grid>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <AttendantPerformance
                  startDate={startDate}
                  endDate={endDate}
                  handleAttendantClick={handleAttendantClick}
                />


                <CriteriaChart startDate={startDate} endDate={endDate} />
            </Grid>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <RecentFeedbacks
                  startDate={startDate}
                  endDate={endDate}
                  handleFeedbackClick={handleFeedbackClick}
                />

                <NpsTrendChart startDate={startDate} endDate={endDate} />
            </Grid>



            <ConversionChart startDate={startDate} endDate={endDate} handleCardClick={handleCardClick} />


        </Container>
    );
};

export default DashboardPage;
