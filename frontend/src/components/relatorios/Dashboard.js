import React, { Suspense } from 'react';
import { 
    Grid, Typography, Box, useTheme, Card, CardContent, CardHeader,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, alpha, Paper,
    CircularProgress,
} from '@mui/material';
import {
    ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, Label,
} from 'recharts';
import WordCloud from 'react-wordcloud';

// Importando ícones
import { TrendingUp, BarChart as BarChartIcon, People, Star, Cloud, CheckCircle, Chat as ChatIcon, ShowChart } from '@mui/icons-material';
import FeedbacksList from './FeedbacksList';

const NPS_COLORS = ['#2ECC71', '#F1C40F', '#E74C3C']; // Promotores, Neutros, Detratores
const CSAT_COLORS = ['#2ECC71', '#F1C40F', '#E74C3C']; // Satisfeitos, Neutros, Insatisfeitos

const RADIAN = Math.PI / 180;
const CustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomCenterLabel = ({ total }) => (
    <g>
        <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Total
        </text>
        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {total}
        </text>
    </g>
);

const CustomLegend = (props) => {
    const { payload } = props;
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            {payload.map((entry, index) => (
                <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Box sx={{ width: 14, height: 14, backgroundColor: entry.color, mr: 1 }} />
                    <Typography variant="body2">{`${entry.value}: ${entry.payload.value}`}</Typography>
                </Box>
            ))}
        </Box>
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

const Dashboard = ({ data, reportType }) => {
    const theme = useTheme();

    if (!data) {
        return <NoData message="Nenhum dado disponível para o período selecionado." />;
    }

    const { npsTrend, criteriaScores, attendantsPerformance, feedbacks, wordCloudData, npsDistribution } = data;

    const npsPieData = npsDistribution?.map(item => ({ name: item.name, value: item.value })) || [];
    
    const processedCriteriaScores = criteriaScores?.map(item => ({
        ...item,
        score: item.scoreType === 'NPS' ? item.npsScore : item.satisfactionRate,
    }));

    // Determinar o domínio com base nos tipos de score presentes
    const scoreTypes = processedCriteriaScores?.map(i => i.scoreType);
    let domain = [0, 100]; // Default para CSAT
    if (scoreTypes?.includes('NPS')) {
        domain = [-100, 100];
    }

    const trendTitle = reportType === 'diario' ? 'Tendência do NPS (Diário)' :
                       reportType === 'semanal' ? 'Tendência do NPS (Semanal)' :
                       'Tendência do NPS (Mensal)';
    
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
                                    <Pie 
                                        data={npsPieData} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={70} 
                                        outerRadius={90} 
                                        fill="#8884d8" 
                                        paddingAngle={5} 
                                        labelLine={false}
                                        label={<CustomizedLabel />}
                                    >
                                        {npsPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={NPS_COLORS[index % NPS_COLORS.length]} />
                                        ))}
                                        <Label 
                                            content={<CustomCenterLabel total={npsDistribution.reduce((acc, item) => acc + item.value, 0)} />} 
                                            position="center" 
                                        />
                                    </Pie>
                                    <Tooltip />
                                    <Legend content={<CustomLegend />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <NoData />}
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
                 <Card elevation={3}>
                    <CardHeader title={trendTitle} avatar={<ShowChart />} />
                    <CardContent>
                        {npsTrend && npsTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                {reportType === 'diario' ? (
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
                                ) : (
                                    <BarChart data={npsTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="nps" fill={theme.palette.primary.main} name="NPS" />
                                    </BarChart>
                                )}
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
                            <Suspense fallback={<CircularProgress />}>
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
                            </Suspense>
                        ) : <NoData />}
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
                 <Card elevation={3}>
                    <CardHeader title="Satisfação por Critério" avatar={<CheckCircle />} />
                    <CardContent>
                        {processedCriteriaScores && processedCriteriaScores.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={processedCriteriaScores} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={domain} />
                                    <YAxis type="category" dataKey="criterion" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="score" fill={theme.palette.secondary.main} name="Pontuação" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <NoData />}
                    </CardContent>
                </Card>
            </Grid>            {/* Seção: Desempenho e Feedbacks */}
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
