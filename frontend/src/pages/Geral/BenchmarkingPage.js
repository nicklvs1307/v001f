import React, { useState } from 'react';
import { Typography, Box, Container, Grid, Paper, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const initialData = {
  restaurantes: {
    nps: { suaEmpresa: 75, media: 65 },
    satisfacao: { suaEmpresa: 85, media: 78 },
  },
  varejo: {
    nps: { suaEmpresa: 78, media: 70 },
    satisfacao: { suaEmpresa: 88, media: 82 },
  },
  servicos: {
    nps: { suaEmpresa: 80, media: 75 },
    satisfacao: { suaEmpresa: 90, media: 85 },
  },
};

const BenchmarkingPage = () => {
  const [segment, setSegment] = useState('restaurantes');

  const npsData = [
    { name: 'Sua Empresa', nps: initialData[segment].nps.suaEmpresa },
    { name: 'Média do Mercado', nps: initialData[segment].nps.media },
  ];

  const satisfacaoData = [
    { name: 'Sua Empresa', satisfacao: initialData[segment].satisfacao.suaEmpresa },
    { name: 'Média do Mercado', satisfacao: initialData[segment].satisfacao.media },
  ];

  const npsDiff = initialData[segment].nps.suaEmpresa - initialData[segment].nps.media;
  const satisfacaoDiff = initialData[segment].satisfacao.suaEmpresa - initialData[segment].satisfacao.media;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Benchmarking de Indicadores
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Compare o desempenho da sua empresa com a média do mercado.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <FormControl>
          <InputLabel id="segment-select-label">Segmento</InputLabel>
          <Select
            labelId="segment-select-label"
            id="segment-select"
            value={segment}
            label="Segmento"
            onChange={(e) => setSegment(e.target.value)}
          >
            <MenuItem value="restaurantes">Restaurantes</MenuItem>
            <MenuItem value="varejo">Varejo</MenuItem>
            <MenuItem value="servicos">Serviços</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Diferença de NPS
              </Typography>
              <Typography variant="h4" component="p" color={npsDiff >= 0 ? 'success.main' : 'error.main'}>
                {npsDiff > 0 ? `+${npsDiff}` : npsDiff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Diferença de Satisfação
              </Typography>
              <Typography variant="h4" component="p" color={satisfacaoDiff >= 0 ? 'success.main' : 'error.main'}>
                {satisfacaoDiff > 0 ? `+${satisfacaoDiff.toFixed(1)}` : satisfacaoDiff.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Benchmarking de NPS
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={npsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="nps" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Benchmarking de Satisfação
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={satisfacaoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="satisfacao" fill="#82ca9d" />
              </BarChart>
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
                    <TableCell>Métrica</TableCell>
                    <TableCell align="right">Sua Empresa</TableCell>
                    <TableCell align="right">Média do Mercado</TableCell>
                    <TableCell align="right">Diferença</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>NPS</TableCell>
                    <TableCell align="right">{initialData[segment].nps.suaEmpresa}</TableCell>
                    <TableCell align="right">{initialData[segment].nps.media}</TableCell>
                    <TableCell align="right" sx={{ color: npsDiff >= 0 ? 'success.main' : 'error.main' }}>
                      {npsDiff > 0 ? `+${npsDiff}` : npsDiff}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Satisfação</TableCell>
                    <TableCell align="right">{initialData[segment].satisfacao.suaEmpresa}%</TableCell>
                    <TableCell align="right">{initialData[segment].satisfacao.media}%</TableCell>
                    <TableCell align="right" sx={{ color: satisfacaoDiff >= 0 ? 'success.main' : 'error.main' }}>
                      {satisfacaoDiff > 0 ? `+${satisfacaoDiff.toFixed(1)}` : satisfacaoDiff.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BenchmarkingPage;