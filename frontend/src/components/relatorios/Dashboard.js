import React from 'react';
import { 
    Grid, Typography, Box, useTheme, Card, CardContent,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, alpha, Paper,
} from '@mui/material';
import {
    ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area,
} from 'recharts';
import WordCloud from 'react-wordcloud';

// Importando ícones
import { TrendingUp, BarChart as BarChartIcon, People, Star, Cloud, CheckCircle, Chat as ChatIcon, ShowChart } from '@mui/icons-material';
import FeedbacksList from './FeedbacksList';

const NPS_COLORS = ['#2ECC71', '#F1C40F', '#E74C3C']; // Promotores, Neutros, Detratores
const CSAT_COLORS = ['#2ECC71', '#F1C40F', '#E74C3C']; // Satisfeitos, Neutros, Insatisfeitos

const StatCard = ({ title, icon, children }) => {
    const theme = useTheme();
    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            boxShadow: `0 4px 20px ${alpha(theme.palette.grey[500], 0.1)}`,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
            background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.grey[100], 0.5)})`,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 8px 30px ${alpha(theme.palette.grey[500], 0.2)}`,
            }
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 'medium' }}>{title}</Typography>
                </Box>
                {children}
            </CardContent>
        </Card>
    );
};

const NoData = ({ message = "Dados não disponíveis." }) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 150 }}>
        <Typography variant="body2" color="text.secondary">
            {message}
        </Typography>
    </Box>
);

const SectionHeader = ({ title, icon }) => (
    <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
            {icon}
            <Typography variant="h5" sx={{ ml: 1, fontWeight: 'bold' }}>{title}</Typography>
        </Box>
    </Grid>
);

const CustomTooltip = ({ active, payload, label }) => {
    const theme = useTheme();
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ padding: '10px', background: alpha(theme.palette.background.paper, 0.9), borderRadius: '8px' }}>
                <Typography variant="subtitle2">{`Período: ${label}`}</Typography>
                {payload.map((pld, index) => (
                    <Typography key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ${pld.value.toFixed(1)}`}
                    </Typography>
                ))}
            </Paper>
        );
    }
    return null;
};

const Dashboard = ({ data }) => {
    const theme = useTheme();

    if (!data) {
        return <NoData message="Nenhum dado disponível para o período selecionado." />;
    }

    const { summary, npsTrend, criteriaScores, attendantsPerformance, feedbacks, clientStatusCounts, wordCloudData } = data;

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

            {/* Seção: Visão Geral */}
            <SectionHeader title="Visão Geral" icon={<BarChartIcon color="primary" />} />

            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="NPS Geral" icon={<TrendingUp color="primary" />}>
                    {nps && typeof nps.score === 'number' ? (
                        <Typography variant="h3" component="div" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.dark', mt: 2 }}>
                            {nps.score.toFixed(1)}
                        </Typography>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="CSAT Geral" icon={<Star color="primary" />}>
                    {csat && typeof csat.satisfactionRate === 'number' ? (
                        <Typography variant="h3" component="div" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.dark', mt: 2 }}>
                            {csat.satisfactionRate.toFixed(1)}%
                        </Typography>
                    ) : <NoData />}
                </StatCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total de Respostas" icon={<BarChartIcon color="primary" />}>
                    <Typography variant="h3" component="div" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.dark', mt: 2 }}>
                        {totalResponses ?? '0'}
                    </Typography>
                </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Respostas com Cadastro" icon={<CheckCircle color="primary" />}>
                    <Typography variant="h3" component="div" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.dark', mt: 2 }}>
                        {clientStatusCounts?.withClient ?? '0'}
                    </Typography>
                </StatCard>
            </Grid>

            {/* Seção: Análise de Sentimento */}
            <SectionHeader title="Análise de Sentimento" icon={<ShowChart color="primary" />} />
            
            <Grid item xs={12} lg={6}>
                <StatCard title="Distribuição NPS" icon={<TrendingUp color="primary" />}>
                    {npsPieData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={npsPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                    {npsPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={NPS_COLORS[index % NPS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <StatCard title="Tendência do NPS" icon={<ShowChart color="primary" />}>
                    {npsTrend && npsTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                             <ComposedChart data={npsTrend}>
                                <defs>
                                    <linearGradient id="colorNps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type="monotone" dataKey="nps" fill="url(#colorNps)" stroke={theme.palette.primary.dark} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <StatCard title="Nuvem de Palavras" icon={<Cloud color="primary" />}>
                    {wordCloudData && wordCloudData.length > 0 ? (
                        <Box sx={{ height: 300, width: '100%' }}>
                            <WordCloud
                                words={wordCloudData}
                                options={{
                                    fontFamily: theme.typography.fontFamily,
                                    fontWeight: "bold",
                                    fontSizes: [20, 80],
                                    padding: 5,
                                    rotations: 2,
                                    rotationAngles: [-90, 0],
                                    colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.primary.light, theme.palette.secondary.light],
                                    spiral: 'archimedean',
                                    deterministic: false
                                }}
                            />
                        </Box>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            <Grid item xs={12} lg={6}>
                <StatCard title="Satisfação por Critério" icon={<CheckCircle color="primary" />}>
                    {criteriaScores && criteriaScores.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={criteriaScores} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="criterion" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="npsScore" fill={theme.palette.primary.main} name="NPS" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            {/* Seção: Desempenho e Feedbacks */}
            <SectionHeader title="Desempenho e Feedbacks" icon={<People color="primary" />} />

            <Grid item xs={12} md={6}>
                <StatCard title="Ranking de Atendentes" icon={<People color="primary" />}>
                    {attendantsPerformance && attendantsPerformance.length > 0 ? (
                        <TableContainer>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Atendente</TableCell>
                                        <TableCell align="right">NPS</TableCell>
                                        <TableCell align="right">Respostas</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendantsPerformance.map((attendant, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell component="th" scope="row">{attendant.name}</TableCell>
                                            <TableCell align="right">{attendant.currentNPS ?? 'N/A'}</TableCell>
                                            <TableCell align="right">{attendant.responses}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            <Grid item xs={12} md={6}>
                <FeedbacksList feedbacks={feedbacks?.rows} />
            </Grid>

        </Grid>
    );
};

export default Dashboard;
