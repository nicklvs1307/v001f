import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';

import FranchisorSummaryMetrics from '../components/Franchisor/FranchisorSummaryMetrics';
import FranchisorResponseCharts from '../components/Franchisor/FranchisorResponseCharts';
import FranchisorAttendantPerformance from '../components/Franchisor/FranchisorAttendantPerformance';
import FranchisorCriteriaChart from '../components/Franchisor/FranchisorCriteriaChart';
import FranchisorNpsTrendChart from '../components/Franchisor/FranchisorNpsTrendChart';
import FranchisorConversionChart from '../components/Franchisor/FranchisorConversionChart';

const FranchisorDashboardPage = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard Consolidado da Franqueadora
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

            <FranchisorSummaryMetrics startDate={startDate} endDate={endDate} />

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <FranchisorResponseCharts startDate={startDate} endDate={endDate} />
            </Grid>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <FranchisorAttendantPerformance
                  startDate={startDate}
                  endDate={endDate}
                />
                <FranchisorCriteriaChart startDate={startDate} endDate={endDate} />
            </Grid>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <FranchisorNpsTrendChart startDate={startDate} endDate={endDate} />
            </Grid>

            <FranchisorConversionChart startDate={startDate} endDate={endDate} />
        </Container>
    );
};

export default FranchisorDashboardPage;
