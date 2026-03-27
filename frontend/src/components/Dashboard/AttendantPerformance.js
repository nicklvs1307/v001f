import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Avatar,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import dashboardService from '../../services/dashboardService';

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarColors = [
    '#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6',
];

const AttendantPerformance = ({ startDate, endDate, handleAttendantClick }) => {
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
                if (startDate) params.startDate = getStartOfDayUTC(startDate);
                if (endDate) params.endDate = getEndOfDayUTC(endDate);
                const data = await dashboardService.getAttendantsPerformance(params);
                if (isActive) setAttendantsPerformance(data);
            } catch (err) {
                if (isActive) setError(err.message || 'Falha ao carregar a performance dos atendentes.');
            } finally {
                if (isActive) setLoading(false);
            }
        };

        fetchAttendantPerformance();
        return () => { isActive = false; };
    }, [startDate, endDate]);

    const filteredAttendants = attendantsPerformance?.filter((attendant) =>
        attendant.name.toLowerCase().includes(attendantSearch.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <CircularProgress />
                </Paper>
            </Grid>
        );
    }

    if (error) {
        return (
            <Grid item xs={12} md={6}>
                <Alert severity="error">{error}</Alert>
            </Grid>
        );
    }

    return (
        <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        Top Atendentes
                    </Typography>
                </Box>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar atendente..."
                    size="small"
                    sx={{ mb: 2 }}
                    value={attendantSearch}
                    onChange={(e) => setAttendantSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {filteredAttendants.map((attendant, index) => (
                        <Box
                            key={attendant.id || index}
                            onClick={() => handleAttendantClick(attendant.id)}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 1.5,
                                px: 1,
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                '&:hover': { backgroundColor: '#f8fafc' },
                                '&:last-child': { borderBottom: 'none' },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        background: `linear-gradient(135deg, ${avatarColors[index % avatarColors.length]} 0%, ${avatarColors[(index + 3) % avatarColors.length]} 100%)`,
                                    }}
                                >
                                    {getInitials(attendant.name)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                        {attendant.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {attendant.responses} respostas
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" fontWeight={700} color="text.primary">
                                    NPS: {attendant.currentNPS}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    CSAT: {attendant.currentCSAT}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                    {filteredAttendants.length === 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Nenhum atendente encontrado.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Grid>
    );
};

export default AttendantPerformance;
