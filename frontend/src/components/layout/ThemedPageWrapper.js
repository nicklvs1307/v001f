import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import getDynamicTheme from '../../getDynamicTheme';
import publicSurveyService from '../../services/publicSurveyService';

const ThemedPageWrapper = ({ tenantId, children, fallbackBg = true }) => {
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        if (!tenantId) {
            setError('ID da empresa não encontrado.');
            setLoading(false);
            return;
        }

        publicSurveyService.getPublicTenantById(tenantId)
            .then(tenantData => {
                if (controller.signal.aborted) return;
                setTenant(tenantData);
            })
            .catch(err => {
                if (controller.signal.aborted) return;
                setError('Não foi possível carregar os dados da empresa.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [tenantId]);

    const dynamicTheme = useMemo(() => {
        if (!tenant) return null;
        return getDynamicTheme({
            primaryColor: tenant.primaryColor,
            secondaryColor: tenant.secondaryColor,
        });
    }, [tenant]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !dynamicTheme) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                            Tentar novamente
                        </Button>
                    }
                >
                    {error || 'Erro ao carregar tema.'}
                </Alert>
            </Box>
        );
    }

    return (
        <ThemeProvider theme={dynamicTheme}>
            {typeof children === 'function' ? children({ tenant, theme: dynamicTheme }) : children}
        </ThemeProvider>
    );
};

export default React.memo(ThemedPageWrapper);
