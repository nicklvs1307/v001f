
import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartCard = ({ title, score, scoreLabel, data, colors, loading }) => {
    const hasData = data && data.some(item => item.value > 0);

    return (
        <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                {title}
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box sx={{ position: 'relative', flexGrow: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                {hasData ? (
                                    <>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={'80%'}
                                            innerRadius={'60%'}
                                            fill="#8884d8"
                                            dataKey="value"
                                            isAnimationActive={true}
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </>
                                ) : (
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#888">
                                        Sem dados no período
                                    </text>
                                )}
                            </PieChart>
                        </ResponsiveContainer>
                        {hasData && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}
                            >
                                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                                    {score}
                                </Typography>
                                {scoreLabel && <Typography variant="caption">{scoreLabel}</Typography>}
                            </Box>
                        )}
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default ChartCard;
