import React from 'react';
import { Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendantPerformance = ({ topAttendants, bottomAttendants }) => {
    const attendantNpsData = [...(topAttendants || []), ...(bottomAttendants || [])]
        .filter((attendant, index, self) => 
            index === self.findIndex((t) => (
                t.name === attendant.name
            ))
        )
        .map(attendant => ({
            name: attendant.name,
            NPS: attendant.currentNPS
        }));

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Desempenho dos Atendentes</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Top 5 Atendentes (por Respostas)</Typography>
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
                                {topAttendants && topAttendants.map((attendant, index) => (
                                    <TableRow key={index}>
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
                    <Typography variant="subtitle1" gutterBottom>Bottom 5 Atendentes (por Respostas)</Typography>
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
                                {bottomAttendants && bottomAttendants.map((attendant, index) => (
                                    <TableRow key={index}>
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
                    <Typography variant="subtitle1" gutterBottom>NPS por Atendente</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={attendantNpsData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[-100, 100]} />
                            <YAxis type="category" dataKey="name" width={150} />
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