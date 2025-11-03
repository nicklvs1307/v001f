import React, { useState } from 'react';
import { Typography, Box, Container, Grid, Paper, Button, ButtonGroup, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const initialData = {
  '30d': [
    { name: 'Sem 1', nps: 40, satisfacao: 60 },
    { name: 'Sem 2', nps: 42, satisfacao: 62 },
    { name: 'Sem 3', nps: 45, satisfacao: 65 },
    { name: 'Sem 4', nps: 48, satisfacao: 68 },
  ],
  '6m': [
    { name: 'Jan', nps: 40, satisfacao: 60 },
    { name: 'Fev', nps: 45, satisfacao: 65 },
    { name: 'Mar', nps: 50, satisfacao: 70 },
    { name: 'Abr', nps: 55, satisfacao: 75 },
    { name: 'Mai', nps: 60, satisfacao: 80 },
    { name: 'Jun', nps: 65, satisfacao: 85 },
  ],
  '1a': [
    { name: 'Jan', nps: 40, satisfacao: 60 },
    { name: 'Fev', nps: 45, satisfacao: 65 },
    { name: 'Mar', nps: 50, satisfacao: 70 },
    { name: 'Abr', nps: 55, satisfacao: 75 },
    { name: 'Mai', nps: 60, satisfacao: 80 },
    { name: 'Jun', nps: 65, satisfacao: 85 },
    { name: 'Jul', nps: 68, satisfacao: 88 },
    { name: 'Ago', nps: 70, satisfacao: 90 },
    { name: 'Set', nps: 72, satisfacao: 92 },
    { name: 'Out', nps: 75, satisfacao: 95 },
    { name: 'Nov', nps: 78, satisfacao: 98 },
    { name: 'Dez', nps: 80, satisfacao: 100 },
  ],
};

const EvolucaoPage = () => {
  const [period, setPeriod] = useState('6m');

  const data = initialData[period];
  const currentNPS = data[data.length - 1].nps;
  const avgSatisfaction = data.reduce((acc, cur) => acc + cur.satisfacao, 0) / data.length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Evolução dos Indicadores
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Acompanhe a evolução do NPS e da Satisfação ao longo do tempo.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                NPS Atual
              </Typography>
              <Typography variant="h4" component="p">
                {currentNPS}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Satisfação Média
              </Typography>
              <Typography variant="h4" component="p">
                {avgSatisfaction.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Evolução Mensal
              </Typography>
              <ButtonGroup variant="outlined" aria-label="outlined button group">
                <Button onClick={() => setPeriod('30d')} variant={period === '30d' ? 'contained' : 'outlined'}>30 dias</Button>
                <Button onClick={() => setPeriod('6m')} variant={period === '6m' ? 'contained' : 'outlined'}>6 meses</Button>
                <Button onClick={() => setPeriod('1a')} variant={period === '1a' ? 'contained' : 'outlined'}>1 ano</Button>
              </ButtonGroup>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="nps" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="satisfacao" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Dados Detalhados
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Período</TableCell>
                    <TableCell align="right">NPS</TableCell>
                    <TableCell align="right">Satisfação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row.nps}</TableCell>
                      <TableCell align="right">{row.satisfacao}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EvolucaoPage;