import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import AtendenteList from '../components/atendentes/AtendenteList';

const AttendantsPage = () => {
    return (
        <Container>
            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Gestão de Atendentes
                </Typography>
                <AtendenteList />
            </Box>
        </Container>
    );
};

export default AttendantsPage;
