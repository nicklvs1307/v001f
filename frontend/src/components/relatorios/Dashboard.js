import React, { useMemo } from 'react';
import { 
    Paper, Grid, Typography, Box, useTheme, Card, CardContent, CardHeader,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar
} from '@mui/material';
import {
    ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area
} from 'recharts';
import { WordCloud } from '@isoterik/react-word-cloud';

// Importando ícones
import { TrendingUp, BarChart as BarChartIcon, People, Star, Cloud, CheckCircle, DonutLarge, Chat as ChatIcon } from '@mui/icons-material';
import FeedbacksList from './FeedbacksList';

const NPS_COLORS = ['#2ECC71', '#F1C40F', '#E74C3C']; // Promoters, Neutrals, Detractors
const CSAT_COLORS = ['#2ECC71', '#F1C40F', '#E74C3C']; // Satisfied, Neutral, Unsatisfied

const StatCard = ({ title, icon, children }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, boxShadow: '0 4px 12px 0 rgba(0,0,0,0.07)' }}>
        <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{icon}</Avatar>}
            title={<Typography variant="h6">{title}</Typography>}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {children}
        </CardContent>
    </Card>
);

const NoData = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 150 }}>
        <Typography variant="body2" color="text.secondary">
            Dados não disponíveis.
        </Typography>
    </Box>
);

const Dashboard = ({ data }) => {
    const theme = useTheme();

    const wordCloudData = data?.wordCloudData;

    const processedWordCloudData = useMemo(() => {
        if (!wordCloudData || wordCloudData.length === 0) {
            return [];
        }
        const values = wordCloudData.map(w => w.value);
        const min = Math.min(...values);
        const max = Math.max(...values);

        if (min === max) {
            const newWords = [...wordCloudData];
            newWords[0] = { ...newWords[0], value: newWords[0].value + 1 };
            return newWords;
        }
        return wordCloudData;
    }, [wordCloudData]);

    if (!data) {
        return <Typography>Nenhum dado disponível para o período selecionado.</Typography>;
    }

    const { summary, npsTrend, criteriaScores, attendantsPerformance, conversionChart, feedbacks, clientStatusCounts } = data;

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
            <Grid item xs={12} sm={6} md={4}>
                <StatCard title="NPS Geral" icon={<TrendingUp />}>
                    {nps && nps.score !== null ? (
                        <>
                            <Typography variant="h2" component="div" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.dark' }}>
                                {nps.score}
                            </Typography>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={npsPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5}>
                                        {npsPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={NPS_COLORS[index % NPS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            {/* Total Responses */}
            <Grid item xs={12} sm={6} md={4}>
                <StatCard title="Total de Respostas" icon={<BarChartIcon />}>
                    <Typography variant="h2" component="div" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.dark' }}>
                        {totalResponses ?? '0'}
                    </Typography>
                </StatCard>
            </Grid>
            
            {/* CSAT Score */}
            <Grid item xs={12} sm={6} md={4}>
                <StatCard title="CSAT Geral" icon={<Star />}>
                    {csat && csat.satisfactionRate !== null ? (
                        <>
                            <Typography variant="h2" component="div" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.dark' }}>
                                {csat.satisfactionRate}%
                            </Typography>
                            <Typography variant="body1" component="div" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                Média: {csat.averageScore}
                            </Typography>
                             <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={csatPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" paddingAngle={5}>
                                        {csatPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CSAT_COLORS[index % CSAT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            {/* Client Status Counts */}
            <Grid item xs={12} sm={6} md={6}>
                <StatCard title="Respostas com Cadastro" icon={<CheckCircle />}>
                    <Typography variant="h2" component="div" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.dark' }}>
                        {clientStatusCounts?.withClient ?? '0'}
                    </Typography>
                </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
                <StatCard title="Respostas sem Cadastro" icon={<ChatIcon />}>
                    <Typography variant="h2" component="div" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.dark' }}>
                        {clientStatusCounts?.withoutClient ?? '0'}
                    </Typography>
                </StatCard>
            </Grid>

            {/* NPS Trend */}
            <Grid item xs={12}>
                <StatCard title="Tendência do NPS" icon={<TrendingUp />}>
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
                    ) : <NoData />}
                </StatCard>
            </Grid>

            {/* Word Cloud */}
            <Grid item xs={12} md={6}>
                <StatCard title="Nuvem de Palavras" icon={<Cloud />}>
                    {processedWordCloudData && processedWordCloudData.length > 0 ? (
                        <Box sx={{ height: 300, width: '100%' }}>
                            <WordCloud
                                words={processedWordCloudData}
                                options={{
                                    fontFamily: theme.typography.fontFamily,
                                    fontWeight: "bold",
                                    fontSizes: [20, 80],
                                    padding: 5,
                                    rotations: 2,
                                    rotationAngles: [-45, 45],
                                    colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.primary.light, theme.palette.secondary.light],
                                }}
                            />
                        </Box>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            {/* Criteria Comparison */}
            <Grid item xs={12} md={6}>
                <StatCard title="Satisfação por Critério" icon={<CheckCircle />}>
                    {criteriaScores && criteriaScores.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={criteriaScores} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="criterion" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="promoters" stackId="a" fill="#2ECC71" name="Promotores" />
                                <Bar dataKey="neutrals" stackId="a" fill="#F1C40F" name="Neutros" />
                                <Bar dataKey="detractors" stackId="a" fill="#E74C3C" name="Detratores" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            {/* Conversion Chart */}
            <Grid item xs={12} md={6}>
                <StatCard title="Conversão de Pesquisa" icon={<DonutLarge />}>
                    {conversionChart && conversionChart.total > 0 ? (
                         <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Completaram', value: conversionChart.completed },
                                        { name: 'Abandonaram', value: conversionChart.abandoned },
                                    ]}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill={theme.palette.primary.main}
                                    label
                                >
                                    <Cell fill={theme.palette.success.main} />
                                    <Cell fill={theme.palette.error.main} />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </StatCard>
            </Grid>

            {/* Attendants Leaderboard */}
            <Grid item xs={12} md={6}>
                <StatCard title="Ranking de Atendentes" icon={<People />}>
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

            {/* Feedbacks List */}
            <Grid item xs={12}>
                <FeedbacksList feedbacks={feedbacks} />
            </Grid>

        </Grid>
    );
};

export default Dashboard;
