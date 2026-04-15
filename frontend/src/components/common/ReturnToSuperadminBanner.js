import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ReturnToSuperadminBanner = () => {
    const navigate = useNavigate();

    const handleReturn = () => {
        const superadminToken = localStorage.getItem('superadmin_token');
        if (superadminToken) {
            localStorage.setItem('userToken', superadminToken);
            localStorage.removeItem('superadmin_token');
            window.location.reload();
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: 'error.main',
                color: 'white',
                p: 1,
                textAlign: 'center',
                position: 'fixed',
                width: '100%',
                zIndex: 1201, // Above the AppBar
            }}
        >
            <Typography variant="body2" component="span" sx={{ mr: 2 }}>
                Você está visualizando como um tenant.
            </Typography>
            <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={handleReturn}
            >
                Retornar ao Superadmin
            </Button>
        </Box>
    );
};

export default ReturnToSuperadminBanner;
