import React from 'react';
import { Container, Paper } from '@mui/material';

const PublicPageLayout = ({ children, maxWidth = "sm", textAlign = "center", paperSx }) => {
    return (
        <Container component="main" maxWidth={maxWidth} sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: textAlign, ...paperSx }}>
                {children}
            </Paper>
        </Container>
    );
};

export default PublicPageLayout;
