import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import UserList from '../components/users/UserList';

const UserListPage = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Gerenciar Usuários
                </Typography>
                <UserList />
            </Paper>
        </Container>
    );
};

export default UserListPage;
