import React from 'react';
import { Paper, Grid, Typography, Box, useTheme } from '@mui/material';
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

const NPS_COLORS = ['#2ECC71', '#F1C40F', '#E74C3C']; // Promoters, Neutrals, Detractors

const Card = ({ title, children }) => (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom component="div">{title}</Typography>
        {children}
    </Paper>
);

const Dashboard = ({ data }) => {
  const theme = useTheme();

  if (!data) {
    return <Typography>Nenhum dado disponível para o período selecionado.</Typography>;
  }

  // Correctly destructure the data from the API response
  const { summary, npsTrend, wordCloudData, criteriaScores, attendantsPerformance, conversionChart } = data;

  const nps = summary?.nps;
  const totalResponses = summary?.totalResponses;
  const csat = summary?.csat;

  const npsPieData = nps ? [
    { name: 'Promotores', value: nps.promoters },
    { name: 'Neutros', value: nps.neutrals },
    { name: 'Detratores', value: nps.detractors },
  ] : [];

  const csatPieData = csat ? [
    { name: 'Satisfeitos', value: csat.satisfied },
    { name: 'Neutros', value: csat.neutral },
    { name: 'Insatisfeitos', value: csat.unsatisfied },
  ] : [];

  return (
    <Grid container spacing={3}>
      {/* NPS Score */}
      <Grid item xs={12} md={4}>
        <Card title="NPS Geral">
          <Typography variant="h2" component="div" sx={{ flexGrow: 1, textAlign: 'center', mt: 2 }}>{nps?.score ?? 'N/A'}</Typography>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={npsPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5}>
                {npsPieData.map((entry, index) => (
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
            <Typography variant="h2" component="div" sx={{ flexGrow: 1, textAlign: 'center', mt: 4 }}>{totalResponses ?? 'N/A'}</Typography>
        </Card>
      </Grid>
      
      {/* CSAT Score */}
      <Grid item xs={12} md={4}>
        <Card title="CSAT Geral">
            <Typography variant="h2" component="div" sx={{ flexGrow: 1, textAlign: 'center', mt: 2 }}>{csat?.satisfactionRate ?? 'N/A'}%</Typography>
            <Typography variant="body2" component="div" sx={{ textAlign: 'center' }}>Média: {csat?.averageScore ?? 'N/A'}</Typography>
        </Card>
      </Grid>

      {/* NPS Trend */}
      <Grid item xs={12}>
        <Card title="Tendência do NPS">
          {npsTrend && npsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={npsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="nps" fill={theme.palette.primary.light} stroke={theme.palette.primary.main} />
                <Line type="monotone" dataKey="nps" stroke={theme.palette.primary.dark} strokeWidth={2} activeDot={{ r: 8 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <Typography>Dados de tendência indisponíveis.</Typography>}
        </Card>
      </Grid>

      {/* Word Cloud */}
      <Grid item xs={12} md={6}>
        <Card title="Nuvem de Palavras">
          {wordCloudData && wordCloudData.length > 0 ? (
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
          ) : <Typography>Nenhuma palavra para exibir.</Typography>}
        </Card>
      </Grid>

      {/* Criteria Comparison */}
      <Grid item xs={12} md={6}>
        <Card title="Satisfação por Critério">
          {criteriaScores && criteriaScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={criteriaScores} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="criterion" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="promoters" stackId="a" fill="#2ECC71" name="Promotores" />
                <Bar dataKey="neutrals" stackId="a" fill="#F1C40F" name="Neutros" />
                <Bar dataKey="detractors" stackId="a" fill="#E74C3C" name="Detratores" />
              </BarChart>
            </ResponsiveContainer>
          ) : <Typography>Dados de critérios indisponíveis.</Typography>}
        </Card>
      </Grid>

      {/* Attendants Leaderboard */}
      <Grid item xs={12}>
        <Card title="Ranking de Atendentes">
          {attendantsPerformance && attendantsPerformance.length > 0 ? (
            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Atendente</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>NPS</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Respostas</th>
                </tr>
              </thead>
              <tbody>
                {attendantsPerformance.map((attendant, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{attendant.name}</td>
                    <td style={{ padding: '8px' }}>{attendant.currentNPS ?? 'N/A'}</td>
                    <td style={{ padding: '8px' }}>{attendant.responses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Typography>Nenhum dado de atendente disponível.</Typography>}
        </Card>
      </Grid>

    </Grid>
  );
};

export default Dashboard;