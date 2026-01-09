import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import franchisorService from '../../services/franchisorService';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FranchisorAttendantPerformance = ({ startDate, endDate }) => {
    const theme = useTheme();
    const [attendantsPerformance, setAttendantsPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attendantSearch, setAttendantSearch] = useState('');

    useEffect(() => {
        let isActive = true;

        const fetchAttendantPerformance = async () => {
            try {
                setLoading(true);
                setError('');
                const params = {};
                if (startDate) {
                    params.startDate = getStartOfDayUTC(startDate);
                }
                if (endDate) {
                    params.endDate = getEndOfDayUTC(endDate);
                }
                const data = await franchisorService.getDashboard(params);
                if (isActive) {
                    setAttendantsPerformance(data.attendantsPerformance);
                }
            } catch (err) {
                if (isActive) {
                    setError(err.message || 'Falha ao carregar a performance dos atendentes.');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchAttendantPerformance();

        return () => {
            isActive = false;
        };
    }, [startDate, endDate]);

    const handleSearchChange = (event) => {
        setAttendantSearch(event.target.value);
    };

    const filteredAttendants = attendantsPerformance?.filter((attendant) =>
        attendant.name.toLowerCase().includes(attendantSearch.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <Grid item xs={12}>
                <CircularProgress />
                <Alert severity="info">Carregando performance dos atendentes...</Alert>
            </Grid>
        );
    }

    if (error) {
        return (
            <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
            </Grid>
        );
    }

    return (
        <Grid item xs={12} md={6} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
            <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                    Performance dos Atendentes (Todos os Franqueados)
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Pesquisar Atendente"
                    size="small"
                    sx={{ mb: 2 }}
                    value={attendantSearch}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Atendente</TableCell>
                                <TableCell>Respostas</TableCell>
                                <TableCell>NPS</TableCell>
                                <TableCell>Média CSAT</TableCell>
                                <TableCell>Meta NPS</TableCell>
                                <TableCell>Meta CSAT</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAttendants.map((row, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit',
                                    }}
                                >
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.responses}</TableCell>
                                    <TableCell>{row.currentNPS}</TableCell>
                                    <TableCell>{row.currentCSAT}</TableCell>
                                    <TableCell>{row.npsGoal}</TableCell>
                                    <TableCell>{row.csatGoal}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Grid>
    );
};

export default FranchisorAttendantPerformance;
