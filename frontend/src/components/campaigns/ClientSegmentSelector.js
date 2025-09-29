
import React from 'react';
import { Grid, Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { Star, StarBorder, DirectionsRun, AccessibleForward, HelpOutline } from '@mui/icons-material';

const segments = [
    { key: 'todos', title: 'Todos os Clientes', icon: <Star /> },
    { key: 'novatos', title: 'Novatos', description: '1 visita nos últimos 3 meses', icon: <StarBorder /> },
    { key: 'fieis', title: 'Fiéis', description: '2-4 visitas nos últimos 3 meses', icon: <Star /> },
    { key: 'super_cliente', title: 'Super Cliente', description: '5+ visitas nos últimos 3 meses', icon: <Star style={{ color: '#FFD700' }} /> },
    { key: 'inativos', title: 'Inativos', description: 'Nenhuma visita nos últimos 3 meses', icon: <DirectionsRun /> },
    { key: 'curiosos', title: 'Curiosos', description: 'Cadastrados, sem visitas', icon: <HelpOutline /> },
    { key: 'aniversariantes', title: 'Aniversariantes do Mês', icon: <AccessibleForward /> },
];

const ClientSegmentSelector = ({ selectedValue, onChange }) => {
    return (
        <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
                Critério de Seleção de Clientes
            </Typography>
            <Grid container spacing={2}>
                {segments.map((segment) => (
                    <Grid item xs={12} sm={6} md={4} key={segment.key}>
                        <Card 
                            variant="outlined"
                            sx={{ 
                                height: '100%',
                                borderColor: selectedValue === segment.key ? 'primary.main' : 'grey.300',
                                borderWidth: 2,
                                transform: selectedValue === segment.key ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.2s, border-color 0.2s',
                            }}
                        >
                            <CardActionArea onClick={() => onChange(segment.key)} sx={{ height: '100%', p: 2 }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Box sx={{ mb: 1, color: 'primary.main' }}>
                                        {segment.icon}
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {segment.title}
                                    </Typography>
                                    {segment.description && (
                                        <Typography variant="body2" color="text.secondary">
                                            {segment.description}
                                        </Typography>
                                    )}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ClientSegmentSelector;
