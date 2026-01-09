import React from 'react';
import { Paper, Grid, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItem, ListItemText, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { ShoppingCart, Restaurant, Category } from '@mui/icons-material';


const StatCard = ({ title, value, icon }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        {icon}
        <Box sx={{ ml: 2 }}>
            <Typography variant="h6">{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

const ActivityTab = ({ stats }) => {
    const theme = useTheme();
    const { lastVisit, attendanceData, lastOrders, preferences } = stats;

    return (
        <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <StatCard title="Última Visita (Pesquisa)" value={lastVisit ? formatDateForDisplay(lastVisit, 'dd/MM/yyyy') : 'N/A'} />
                </Grid>

                {lastOrders && lastOrders.length > 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, mt: 2 }}>
                            <Typography variant="h6" gutterBottom>Últimos Pedidos</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Plataforma</TableCell>
                                            <TableCell>ID do Pedido</TableCell>
                                            <TableCell>Data</TableCell>
                                            <TableCell align="right">Valor</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lastOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.platform}</TableCell>
                                                <TableCell>{order.orderIdPlatform}</TableCell>
                                                <TableCell>{formatDateForDisplay(order.orderDate, 'dd/MM/yyyy HH:mm')}</TableCell>
                                                <TableCell align="right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                )}

                <Grid item xs={12} md={6}>
                     <Paper sx={{ p: 2, mt: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Produtos Favoritos</Typography>
                        {preferences && preferences.topProducts.length > 0 ? (
                            <List>
                                {preferences.topProducts.map((item, index) => (
                                    <ListItem key={index} secondaryAction={<Typography variant="body2">{item.count}x</Typography>}>
                                        <Restaurant sx={{ mr: 1, color: theme.palette.primary.main }} />
                                        <ListItemText primary={item.name} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">Nenhum produto encontrado.</Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                     <Paper sx={{ p: 2, mt: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Categorias Favoritas</Typography>
                        {preferences && preferences.topCategories.length > 0 ? (
                            <List>
                                {preferences.topCategories.map((item, index) => (
                                    <ListItem key={index} secondaryAction={<Typography variant="body2">{item.count}x</Typography>}>
                                        <Category sx={{ mr: 1, color: theme.palette.secondary.main }} />
                                        <ListItemText primary={item.name} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                             <Typography variant="body2" color="text.secondary">Nenhuma categoria encontrada.</Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="h6" gutterBottom>Comparecimento Mensal (Pesquisas)</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="visits" fill="#4e73df" name="Visitas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ActivityTab;
