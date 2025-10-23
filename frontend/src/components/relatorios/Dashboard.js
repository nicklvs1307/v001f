import React from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import WordCloud from '@isoterik/react-word-cloud';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- Mock Data ---
// TODO: Replace with actual data from the API
const npsTrendData = [
  { name: 'D-6', score: 60 },
  { name: 'D-5', score: 65 },
  { name: 'D-4', score: 70 },
  { name: 'D-3', score: 68 },
  { name: 'D-2', score: 75 },
  { name: 'D-1', score: 78 },
  { name: 'Hoje', score: 80 },
];

const responsesTrendData = [
  { name: 'D-6', count: 15 },
  { name: 'D-5', count: 20 },
  { name: 'D-4', count: 25 },
  { name: 'D-3', count: 22 },
  { name: 'D-2', count: 30 },
  { name: 'D-1', count: 35 },
  { name: 'Hoje', count: 40 },
];

const wordCloudData = [
    { text: 'atendimento', value: 100 },
    { text: 'comida', value: 80 },
    { text: 'ambiente', value: 70 },
    { text: 'preço', value: 60 },
    { text: 'qualidade', value: 90 },
    { text: 'serviço', value: 85 },
    { text: 'excelente', value: 95 },
    { text: 'bom', value: 75 },
    { text: 'ruim', value: 20 },
    { text: 'ótimo', value: 88 },
];

const criteriaComparisonData = [
  { name: 'Atendimento', promoters: 80, passives: 15, detractors: 5 },
  { name: 'Comida', promoters: 70, passives: 20, detractors: 10 },
  { name: 'Ambiente', promoters: 85, passives: 10, detractors: 5 },
  { name: 'Preço', promoters: 60, passives: 25, detractors: 15 },
];

const attendantsLeaderboardData = [
  { name: 'João', score: 9.5, responses: 50 },
  { name: 'Maria', score: 9.2, responses: 45 },
  { name: 'Pedro', score: 8.8, responses: 48 },
  { name: 'Ana', score: 8.5, responses: 42 },
];


const Dashboard = ({ data }) => {
  if (!data) {
    return <Typography>Nenhum dado disponível.</Typography>;
  }

  const { nps, totalResponses, criteria } = data;

  const npsData = nps ? [
    { name: 'Promotores', value: nps.promoters },
    { name: 'Neutros', value: nps.passives },
    { name: 'Detratores', value: nps.detractors },
  ] : [];

  return (
    <Grid container spacing={3}>
      {/* NPS Score */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">NPS Geral</Typography>
          <Typography variant="h3">{nps?.score || 'N/A'}</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={npsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                {npsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Total Responses */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Total de Respostas</Typography>
          <Typography variant="h3">{totalResponses || 'N/A'}</Typography>
        </Paper>
      </Grid>
      
      {/* Placeholder for future metric */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Métrica Futura</Typography>
          <Typography variant="h3">--</Typography>
        </Paper>
      </Grid>

      {/* NPS Trend */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Tendência do NPS</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={npsTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Responses Trend */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Tendência de Respostas</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responsesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Word Cloud */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Nuvem de Palavras</Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            <WordCloud
                data={wordCloudData}
                width={500}
                height={300}
                fontFamily="Verdana"
                fontWeight="bold"
                fontSize={(word) => Math.sqrt(word.value) * 5}
                spiral="archimedean"
                rotate={(word) => word.value % 90}
                padding={2}
                random={Math.random}
            />
          </Box>
        </Paper>
      </Grid>

      {/* Criteria Comparison */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Satisfação por Critério</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={criteriaComparisonData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Legend />
              <Bar dataKey="promoters" stackId="a" fill="#00C49F" name="Promotores" />
              <Bar dataKey="passives" stackId="a" fill="#FFBB28" name="Neutros" />
              <Bar dataKey="detractors" stackId="a" fill="#FF8042" name="Detratores" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Attendants Leaderboard */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Ranking de Atendentes</Typography>
          {/* Basic table for now, can be improved with a dedicated component */}
          <table style={{ width: '100%', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Atendente</th>
                <th>Nota Média</th>
                <th>Respostas</th>
              </tr>
            </thead>
            <tbody>
              {attendantsLeaderboardData.map((attendant, index) => (
                <tr key={index}>
                  <td>{attendant.name}</td>
                  <td>{attendant.score}</td>
                  <td>{attendant.responses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      </Grid>

    </Grid>
  );
};

export default Dashboard;
