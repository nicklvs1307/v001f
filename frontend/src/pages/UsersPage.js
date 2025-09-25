import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import UserList from '../components/users/UserList';

const UserListPage = () => {
    return (
        <Container>
            <Box sx={{ marginTop: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Gerenciar Usuários
                </Typography>
                <UserList />
            </Box>
        </Container>
    );
};

export default UserListPage;
