import React from 'react';
import { 
    Grid, Typography, Box, useTheme, Card, CardContent, CardHeader,
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

    const { npsTrend, criteriaScores, attendantsPerformance, feedbacks, wordCloudData, npsDistribution } = data;

    const npsPieData = npsDistribution?.map(item => ({ name: item.name, value: item.value })) || [];

    return (
        <Grid container spacing={3}>

            {/* Seção: Análise de Sentimento */}
            <SectionHeader title="Análise de Sentimento" icon={<ShowChart color="primary" />} />
            
            <Grid item xs={12} lg={6}>
                <Card elevation={3}>
                    <CardHeader title="Distribuição NPS" avatar={<TrendingUp />} />
                    <CardContent>
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
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
                 <Card elevation={3}>
                    <CardHeader title="Tendência do NPS" avatar={<ShowChart />} />
                    <CardContent>
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
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
                 <Card elevation={3}>
                    <CardHeader title="Nuvem de Palavras" avatar={<Cloud />} />
                    <CardContent>
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
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
                 <Card elevation={3}>
                    <CardHeader title="Satisfação por Critério" avatar={<CheckCircle />} />
                    <CardContent>
                        {criteriaScores && criteriaScores.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={criteriaScores} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis type="category" dataKey="criterion" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="score" fill={theme.palette.primary.main} name="Score" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <NoData />}
                    </CardContent>
                </Card>
            </Grid>

            {/* Seção: Desempenho e Feedbacks */}
            <SectionHeader title="Desempenho e Feedbacks" icon={<People color="primary" />} />

            <Grid item xs={12} md={6}>
                <Card elevation={3}>
                    <CardHeader title="Ranking de Atendentes" avatar={<People />} />
                    <CardContent>
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
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <FeedbacksList feedbacks={feedbacks?.rows} />
            </Grid>

        </Grid>
    );
};


export default Dashboard;
