import React from 'react';
import { Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, useTheme } from '@mui/material';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star } from '@mui/icons-material';

const AttendantPerformance = ({ performanceData }) => {
    const theme = useTheme();

    if (!performanceData || performanceData.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)', height: '100%' }}>
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
        NPS: attendant.currentNPS,
        Respostas: attendant.responses 
    }));

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                    Desempenho dos Atendentes
                </Typography>
            </Box>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>NPS e Volume de Respostas por Atendente</Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart 
                            data={chartData} 
                            layout="vertical" 
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" yAxisId="left" domain={[-100, 100]} />
                            <XAxis type="number" yAxisId="right" orientation="top" />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="NPS" barSize={20} fill={theme.palette.primary.main} />
                            <Line yAxisId="right" type="monotone" dataKey="Respostas" stroke={theme.palette.secondary.main} strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Top 5 Atendentes (por NPS)</Typography>
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
                                    <TableRow key={`top-${index}`}>
                                        <TableCell>{attendant.name}</TableCell>
                                        <TableCell align="right">{attendant.currentNPS}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Últimos 5 Atendentes (por NPS)</Typography>
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
                                    <TableRow key={`bottom-${index}`}>
                                        <TableCell>{attendant.name}</TableCell>
                                        <TableCell align="right">{attendant.currentNPS}</TableCell>
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