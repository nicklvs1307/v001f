import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import TenantList from '../components/tenants/TenantList';

const TenantListPage = () => {
    return (
        <Container>
            <Box sx={{ marginTop: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Gerenciar Tenants
                </Typography>
                <TenantList />
            </Box>
        </Container>
    );
};

export default TenantListPage;
