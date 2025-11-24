import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartCard = ({ title, score, scoreLabel, data, colors, loading }) => {
    const hasData = data && data.some(item => item.value > 0);

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-5px)'
                }
            }}
        >
            <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                {title}
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box sx={{ position: 'relative', flexGrow: 1, minHeight: '200px' }}>
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
                                        <Tooltip formatter={(value, name) => [value, name]} />
                                        <Legend iconSize={10} />
                                    </>
                                ) : (
                                    <Pie
                                        data={[{ value: 1 }]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={'80%'}
                                        innerRadius={'60%'}
                                        fill="#E0E0E0"
                                        dataKey="value"
                                        isAnimationActive={false}
                                    >
                                        <Cell fill="#E0E0E0" />
                                    </Pie>
                                )}
                            </PieChart>
                        </ResponsiveContainer>
                        {hasData ? (
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
                        ) : (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                }}
                            >
                                <Typography variant="body1">Sem dados</Typography>
                            </Box>
                        )}
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default ChartCard;
