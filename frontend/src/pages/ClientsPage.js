import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ClientList from '../components/clients/ClientList'; // Importar ClientList

const ClientManagementPage = () => {
    return (
        <Container>
            <Box sx={{ marginTop: 4 }}> {/* Remover text-align: center para o conteúdo da lista */}
                <ClientList /> {/* Renderizar o componente ClientList */}
            </Box>
        </Container>
    );
};

export default ClientManagementPage;
