import React from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import {
  ComposedChart,
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
  Area,
} from 'recharts';
import { WordCloud } from '@isoterik/react-word-cloud';

const NPS_COLORS = ['#2ECC71', '#F1C40F', '#E74C3C']; // Promoters, Passives, Detractors
const TREND_COLOR = '#3498DB';

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

const Card = ({ title, children }) => (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom component="div">{title}</Typography>
        {children}
    </Paper>
);

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
        <Card title="NPS Geral">
          <Typography variant="h3" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>{nps?.score || 'N/A'}</Typography>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={npsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5}>
                {npsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={NPS_COLORS[index % NPS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Total Responses */}
      <Grid item xs={12} md={4}>
        <Card title="Total de Respostas">
            <Typography variant="h2" component="div" sx={{ flexGrow: 1, textAlign: 'center', mt: 4 }}>{totalResponses || 'N/A'}</Typography>
        </Card>
      </Grid>
      
      {/* Placeholder for future metric */}
      <Grid item xs={12} md={4}>
        <Card title="Métrica Futura">
            <Typography variant="h2" component="div" sx={{ flexGrow: 1, textAlign: 'center', mt: 4 }}>--</Typography>
        </Card>
      </Grid>

      {/* NPS Trend */}
      <Grid item xs={12}>
        <Card title="Tendência do NPS">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={npsTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="score" fill="#e9f3fb" stroke="#3498DB" />
              <Line type="monotone" dataKey="score" stroke="#3498DB" strokeWidth={2} activeDot={{ r: 8 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Responses Trend */}
      <Grid item xs={12}>
        <Card title="Tendência de Respostas">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responsesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill={TREND_COLOR} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Word Cloud */}
      <Grid item xs={12} md={6}>
        <Card title="Nuvem de Palavras">
          <Box sx={{ height: 300, width: '100%' }}>
            <WordCloud
                words={wordCloudData}
                options={{
                    fontFamily: "Verdana",
                    fontWeight: "bold",
                    fontSizes: [20, 80],
                    padding: 2,
                    rotations: 2,
                    rotationAngles: [-60, 0, 60],
                }}
            />
          </Box>
        </Card>
      </Grid>

      {/* Criteria Comparison */}
      <Grid item xs={12} md={6}>
        <Card title="Satisfação por Critério">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={criteriaComparisonData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Legend />
              <Bar dataKey="promoters" stackId="a" fill="#2ECC71" name="Promotores" />
              <Bar dataKey="passives" stackId="a" fill="#F1C40F" name="Neutros" />
              <Bar dataKey="detractors" stackId="a" fill="#E74C3C" name="Detratores" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Attendants Leaderboard */}
      <Grid item xs={12}>
        <Card title="Ranking de Atendentes">
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Atendente</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Nota Média</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Respostas</th>
              </tr>
            </thead>
            <tbody>
              {attendantsLeaderboardData.map((attendant, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>{attendant.name}</td>
                  <td style={{ padding: '8px' }}>{attendant.score}</td>
                  <td style={{ padding: '8px' }}>{attendant.responses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Grid>

    </Grid>
  );
};

export default Dashboard;
