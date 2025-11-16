import React from 'react';
import { Card, CardContent, CardHeader, Box, Typography, List, ListItem, ListItemText, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const QuestionResult = ({ question, chartColors }) => {
    const theme = useTheme();

    const renderChart = () => {
        switch (question.type) {
            case 'rating_0_10':
            case 'rating_1_5':
                const ratingCounts = (question.results.allRatings || []).reduce((acc, rating) => {
                    const key = String(rating);
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
                const chartData = Object.entries(ratingCounts).map(([value, count]) => ({
                    name: value,
                    count: Number(count) || 0,
                }));

                return (
                    <Box sx={{ height: 300 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Avaliação Média: {question.results.averageRating}
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill={theme.palette.primary.light} name="Respostas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                );

            case 'multiple_choice':
            case 'checkbox':
                const pieData = Object.entries(question.results || {}).map(([name, value], idx) => ({
                    name,
                    value: Number(value) || 0,
                }));

                return (
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                );

            case 'free_text':
                return (
                    <Box sx={{ height: 300, overflowY: 'auto' }}>
                        <List dense>
                            {(question.results.responses || []).length > 0 ? (
                                question.results.responses.map((answer, idx) => (
                                    <ListItem key={idx} divider>
                                        <ListItemText primary={answer.text} secondary={`Por: ${answer.clientName || 'Anônimo'}`} />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2">Nenhuma resposta de texto.</Typography>
                            )}
                        </List>
                    </Box>
                );

            default:
                return <Typography>Visualização não suportada para este tipo de questão.</Typography>;
        }
    };

    return (
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardHeader title={question.text} subheader={`Critério: ${question.criterio || 'N/A'}`} />
            <CardContent>
                {renderChart()}
            </CardContent>
        </Card>
    );
};

export default QuestionResult;
