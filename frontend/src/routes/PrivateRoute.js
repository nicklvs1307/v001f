import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import AuthContext from '../context/AuthContext';

const PrivateRoute = () => {
    const { user, loading } = useContext(AuthContext);

    console.log('[PrivateRoute] Loading:', loading, 'User:', user);

    if (loading) {
        console.log('[PrivateRoute] Showing loading spinner...');
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        console.log('[PrivateRoute] No user found, redirecting to /login');
        return <Navigate to="/login" />;
    }

    console.log('[PrivateRoute] User is authenticated, rendering Outlet.');
    return <Outlet />;
};

export default PrivateRoute;
