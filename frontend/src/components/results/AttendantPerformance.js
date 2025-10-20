import React from 'react';
import { Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendantPerformance = ({ performanceData }) => {

    if (!performanceData || performanceData.length === 0) {
        return (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography>Não há dados de desempenho dos atendentes para exibir.</Typography>
            </Paper>
        );
    }

    // Sort attendants by NPS score descending
    const sortedAttendants = [...performanceData].sort((a, b) => (b.currentNPS || -101) - (a.currentNPS || -101));

    const topAttendants = sortedAttendants.slice(0, 5);
    const bottomAttendants = sortedAttendants.length > 5 ? sortedAttendants.slice(-5).reverse() : [];

    const chartData = sortedAttendants.map(attendant => ({
        name: attendant.name,
        NPS: attendant.currentNPS,
    }));

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Desempenho dos Atendentes</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Top 5 Atendentes (por NPS)</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Atendente</TableCell>
                                    <TableCell align="right">Respostas</TableCell>
                                    <TableCell align="right">NPS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topAttendants.map((attendant, index) => (
                                    <TableRow key={`top-${index}`}>
                                        <TableCell>{attendant.name}</TableCell>
                                        <TableCell align="right">{attendant.responses}</TableCell>
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
                                    <TableCell align="right">Respostas</TableCell>
                                    <TableCell align="right">NPS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bottomAttendants.map((attendant, index) => (
                                    <TableRow key={`bottom-${index}`}>
                                        <TableCell>{attendant.name}</TableCell>
                                        <TableCell align="right">{attendant.responses}</TableCell>
                                        <TableCell align="right">{attendant.currentNPS}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>NPS por Atendente</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[-100, 100]} />
                            <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="NPS" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default AttendantPerformance;