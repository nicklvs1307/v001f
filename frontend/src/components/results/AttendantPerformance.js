import React from 'react';
import { Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, useTheme, Chip } from '@mui/material';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Star, TrendingUp, TrendingDown } from '@mui/icons-material';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="body2">{`Atendente: ${label}`}</Typography>
                {payload.map(pld => (
                     <Typography key={pld.dataKey} variant="body2" sx={{ color: pld.color }}>
                        {`${pld.name}: ${pld.value}`}
                    </Typography>
                ))}
            </Paper>
        );
    }
    return null;
};

const AttendantPerformance = ({ performanceData }) => {
    const theme = useTheme();

    if (!performanceData || performanceData.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                    <Star sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                        Desempenho dos Atendentes
                    </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Não há dados de desempenho dos atendentes para exibir.
                </Typography>
            </Paper>
        );
    }

    const sortedAttendants = [...performanceData].sort((a, b) => (b.currentNPS || -101) - (a.currentNPS || -101));
    const topAttendants = sortedAttendants.slice(0, 5);
    const bottomAttendants = sortedAttendants.length > 5 ? sortedAttendants.slice(-5).reverse() : [];
    const chartData = sortedAttendants.map(attendant => ({ 
        name: attendant.name, 
        NPS: Number(attendant.currentNPS) || 0,
        Respostas: Number(attendant.responses) || 0
    }));

    const renderScoreChip = (score) => {
        if (score >= 50) return <Chip label={score} color="success" size="small" />;
        if (score >= 0) return <Chip label={score} color="warning" size="small" />;
        return <Chip label={score} color="error" size="small" />;
    }

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                    Desempenho dos Atendentes
                </Typography>
            </Box>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>NPS e Volume de Respostas por Atendente</Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart 
                            data={chartData} 
                            layout="vertical" 
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis type="number" xAxisId="left" domain={[-100, 100]} tick={{ fill: theme.palette.text.secondary }} />
                            <XAxis type="number" xAxisId="right" orientation="top" tick={{ fill: theme.palette.text.secondary }} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar xAxisId="left" dataKey="NPS" barSize={20} >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.NPS >= 0 ? theme.palette.success.light : theme.palette.error.light} />
                                ))}
                            </Bar>
                            <Line xAxisId="right" type="monotone" dataKey="Respostas" stroke={theme.palette.secondary.main} strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUp color="success" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" gutterBottom>Top 5 Atendentes (por NPS)</Typography>
                    </Box>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Atendente</TableCell>
                                    <TableCell align="right">NPS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topAttendants.map((attendant, index) => (
                                    <TableRow key={`top-${index}`} sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover } }}>
                                        <TableCell>{attendant.name}</TableCell>
                                        <TableCell align="right">{renderScoreChip(attendant.currentNPS)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingDown color="error" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" gutterBottom>Últimos 5 Atendentes (por NPS)</Typography>
                    </Box>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Atendente</TableCell>
                                    <TableCell align="right">NPS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bottomAttendants.map((attendant, index) => (
                                    <TableRow key={`bottom-${index}`} sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover } }}>
                                        <TableCell>{attendant.name}</TableCell>
                                        <TableCell align="right">{renderScoreChip(attendant.currentNPS)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default AttendantPerformance;