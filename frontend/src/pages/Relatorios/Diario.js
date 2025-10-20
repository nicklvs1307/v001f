import React from 'react';
import { Typography, Paper } from '@mui/material';

const RelatorioDiario = () => {
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4">Relatório Diário</Typography>
            <Typography>Conteúdo do relatório diário.</Typography>
        </Paper>
    );
};

export default RelatorioDiario;
