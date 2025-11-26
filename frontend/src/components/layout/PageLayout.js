import React from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';

const PageLayout = ({ 
    title, 
    children,
    showDateFilters = true,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                    <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {title}
                            </Typography>
                        </Grid>
                        {showDateFilters && (
                            <Grid item sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <DatePicker
                                        label="Data de Início"
                                        value={startDate}
                                        onChange={onStartDateChange}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                    <DatePicker
                                        label="Data de Fim"
                                        value={endDate}
                                        onChange={onEndDateChange}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                            </Grid>
                        )}
                    </Grid>
                </Paper>
                {children}
            </Box>
        </LocalizationProvider>
    );
};

export default PageLayout;
