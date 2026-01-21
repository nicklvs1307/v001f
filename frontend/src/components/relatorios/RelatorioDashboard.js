import React, { Suspense } from 'react';
import {
    Grid, Typography, Box, useTheme, Card, CardContent, CardHeader,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, alpha, Paper,
    CircularProgress,
} from '@mui/material';
import ErrorBoundary from '../common/ErrorBoundary';
import {
    ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, Label, AreaChart
} from 'recharts';
import WordCloud from 'react-wordcloud';

// Importando ícones
import { 
    TrendingUp, BarChart as BarChartIcon, People, Star, Cloud, CheckCircle, 
    ShowChart, Person, AccessTime, DeliveryDining, CalendarToday 
} from '@mui/icons-material';
import FeedbacksList from './FeedbacksList';

const NPS_COLORS = ['#2ECC71', '#F1C40F', '#E74C3C']; // Promotores, Neutros, Detratores
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
            {payload.map((entry, index) => (
                <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                    <Box sx={{ width: 14, height: 14, backgroundColor: entry.color, mr: 1, borderRadius: '50%' }} />
                    <Typography variant="body2">{`${entry.value}`}</Typography>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            {icon}
            <Typography variant="h5" sx={{ ml: 1, fontWeight: 'bold', color: 'text.primary' }}>{title}</Typography>
        </Box>
    </Grid>
);

const CustomTooltip = ({ active, payload, label }) => {
    const theme = useTheme();
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ padding: '10px', background: alpha(theme.palette.background.paper, 0.95), borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>{label}</Typography>
                {payload.map((pld, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: pld.color }} />
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                            {`${pld.name}: ${pld.value?.toFixed(1) ?? pld.value}`}
                        </Typography>
                    </Box>
                ))}
            </Paper>
        );
    }
    return null;
};

const RelatorioDashboard = ({ data, reportType, trendTitle }) => {
    const theme = useTheme();

    if (!data) {
        return <NoData message="Nenhum dado disponível para o período selecionado." />;
    }

    const { 
        npsTrend, 
        criteriaScores, 
        attendantsPerformance, 
        feedbacks, 
        wordCloudData, 
        npsDistribution,
        demographics,
        monthSummary,
        deliveryStats
    } = data;

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

    // Processamento de dados demográficos
    const genderData = demographics?.genderDistribution ? 
        Object.entries(demographics.genderDistribution).map(([name, value]) => ({ name, value })) : [];
    
    const ageData = demographics?.ageDistribution ? 
        Object.entries(demographics.ageDistribution).map(([name, value]) => ({ name, value })) : [];

    // Processamento de dados temporais
    const peakHoursData = monthSummary?.peakHours || [];
    const weekdayData = monthSummary?.weekdayDistribution || [];

    // Processamento de delivery
    const deliveryPlatformData = deliveryStats?.byPlatform || [];
    const deliveryStatusData = deliveryStats?.surveyStatus ? 
        Object.entries(deliveryStats.surveyStatus).map(([name, value]) => ({ name, value })) : [];
    
    return (
        <Grid container spacing={3}>

            {/* Seção: Análise de Sentimento */}
            <SectionHeader title="Análise de Sentimento" icon={<ShowChart color="primary" />} />
            
            <Grid item xs={12} lg={4}>
                <ErrorBoundary name="NPS Distribution Chart">
                    <Card elevation={3} sx={{ height: '100%' }}>
                        <CardHeader title="Distribuição NPS" avatar={<TrendingUp color="primary" />} />
                        <CardContent>
                            {(npsPieData && npsDistribution && npsPieData.some(d => d.value > 0)) ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie 
                                            data={npsPieData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            innerRadius={60} 
                                            outerRadius={80} 
                                            fill="#8884d8" 
                                            paddingAngle={5} 
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
                </ErrorBoundary>
            </Grid>

            <Grid item xs={12} lg={8}>
                 <ErrorBoundary name="NPS Trend Chart">
                    <Card elevation={3} sx={{ height: '100%' }}>
                        <CardHeader title={trendTitle} avatar={<ShowChart color="primary" />} />
                        <CardContent>
                            {npsTrend && npsTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    {reportType === 'diario' ? (
                                        <AreaChart data={npsTrend}>
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
                                            <Area type="monotone" dataKey="nps" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorNps)" name="NPS" />
                                        </AreaChart>
                                    ) : (
                                        <BarChart data={npsTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="nps" fill={theme.palette.primary.main} name="NPS" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </CardContent>
                    </Card>
                </ErrorBoundary>
            </Grid>

            {/* Seção: Detalhamento por Critério e Palavras */}
            <Grid item xs={12} lg={6}>
                <ErrorBoundary name="Criteria Satisfaction Chart">
                    <Card elevation={3} sx={{ height: '100%' }}>
                        <CardHeader title="Satisfação por Critério" avatar={<CheckCircle color="secondary" />} />
                        <CardContent>
                            {processedCriteriaScores && processedCriteriaScores.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={processedCriteriaScores} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" domain={domain} />
                                        <YAxis type="category" dataKey="criterion" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="score" fill={theme.palette.secondary.main} name="Pontuação" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </CardContent>
                    </Card>
                </ErrorBoundary>
            </Grid>

            <Grid item xs={12} lg={6}>
                <ErrorBoundary name="WordCloud">
                    <Card elevation={3} sx={{ height: '100%' }}>
                        <CardHeader title="Nuvem de Palavras" avatar={<Cloud color="info" />} />
                        <CardContent>
                            {wordCloudData && wordCloudData.length > 0 ? (
                                <Suspense fallback={<CircularProgress />}>
                                    <Box sx={{ height: 300, width: '100%' }}>
                                        <WordCloud
                                            words={wordCloudData}
                                            options={{
                                                fontFamily: theme.typography.fontFamily,
                                                fontWeight: "bold",
                                                fontSizes: [20, 60],
                                                padding: 2,
                                                rotations: 2,
                                                rotationAngles: [0, 90],
                                                colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main, theme.palette.success.main],
                                                spiral: 'archimedean',
                                                deterministic: false
                                            }}
                                        />
                                    </Box>
                                </Suspense>
                            ) : <NoData />}
                        </CardContent>
                    </Card>
                </ErrorBoundary>
            </Grid>

            {/* Seção: Análise Temporal */}
            {(peakHoursData.length > 0 || weekdayData.length > 0) && (
                <>
                    <SectionHeader title="Padrões de Resposta" icon={<AccessTime color="primary" />} />
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader title="Horários de Pico" subheader="Volume de respostas por hora" avatar={<AccessTime />} />
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={peakHoursData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" tickFormatter={(val) => `${val}h`} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="count" stroke={theme.palette.warning.main} fill={theme.palette.warning.light} name="Respostas" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader title="Dias da Semana" subheader="Volume de respostas por dia" avatar={<CalendarToday />} />
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={weekdayData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" fill={theme.palette.info.main} name="Respostas" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </>
            )}

            {/* Seção: Perfil do Cliente */}
            {(genderData.some(d => d.value > 0) || ageData.some(d => d.value > 0)) && (
                <>
                    <SectionHeader title="Perfil do Cliente" icon={<Person color="primary" />} />
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader title="Gênero" avatar={<Person />} />
                            <CardContent>
                                {genderData.some(d => d.value > 0) ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {genderData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <NoData />}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader title="Faixa Etária" avatar={<Person />} />
                            <CardContent>
                                {ageData.some(d => d.value > 0) ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={ageData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill={theme.palette.success.main} name="Clientes" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <NoData />}
                            </CardContent>
                        </Card>
                    </Grid>
                </>
            )}

            {/* Seção: Delivery (se houver dados) */}
            {deliveryStats && deliveryStats.totalOrders > 0 && (
                <>
                    <SectionHeader title="Delivery" icon={<DeliveryDining color="primary" />} />
                    <Grid item xs={12} md={4}>
                         <Card elevation={3}>
                            <CardHeader title="Pedidos por Plataforma" />
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={deliveryPlatformData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {deliveryPlatformData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                     <Grid item xs={12} md={8}>
                         {/* Placeholder para mais stats de delivery ou um gráfico de barras */}
                         <Card elevation={3}>
                            <CardHeader title="Status das Pesquisas" />
                            <CardContent>
                                 <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={deliveryStatusData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill={theme.palette.secondary.main} name="Quantidade" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                         </Card>
                     </Grid>
                </>
            )}
            
            {/* Seção: Desempenho e Feedbacks */}
            <SectionHeader title="Desempenho e Feedbacks" icon={<People color="primary" />} />

            <Grid item xs={12} md={6}>
                <ErrorBoundary name="Attendants Ranking">
                    <Card elevation={3} sx={{ height: '100%' }}>
                        <CardHeader title="Ranking de Atendentes" avatar={<People />} />
                        <CardContent>
                            {attendantsPerformance && attendantsPerformance.length > 0 ? (
                                <TableContainer sx={{ maxHeight: 400 }}>
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
                                                    <TableCell align="right">{attendant.currentNPS !== undefined ? attendant.currentNPS.toFixed(1) : 'N/A'}</TableCell>
                                                    <TableCell align="right">{attendant.responses}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : <NoData />}
                        </CardContent>
                    </Card>
                </ErrorBoundary>
            </Grid>

            <Grid item xs={12} md={6}>
                <ErrorBoundary name="Feedbacks List">
                    <FeedbacksList feedbacks={feedbacks?.rows} />
                </ErrorBoundary>
            </Grid>

        </Grid>
    );
};

export default RelatorioDashboard;
