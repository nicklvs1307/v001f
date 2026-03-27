import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Fade from '@mui/material/Fade';
import { ThemeProvider } from '@mui/material/styles';
import PrintIcon from '@mui/icons-material/Print';
import QRCode from 'react-qr-code';
import publicSurveyService from '../services/publicSurveyService';
import getDynamicTheme from '../getDynamicTheme';

const loadingBoxSx = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' };

const SurveyPublicQrCodePage = () => {
    const { tenantId, pesquisaId } = useParams();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        publicSurveyService.getPublicSurveyById(pesquisaId)
            .then(data => {
                if (controller.signal.aborted) return;
                setSurvey(data);
            })
            .catch(err => {
                if (controller.signal.aborted) return;
                setError('Não foi possível encontrar a pesquisa.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [pesquisaId]);

    const dynamicTheme = useMemo(() => {
        if (!survey) return null;
        return getDynamicTheme({
            primaryColor: survey.primaryColor,
            secondaryColor: survey.secondaryColor,
        });
    }, [survey]);

    const handlePrint = useCallback(() => window.print(), []);

    if (loading) return <Box sx={loadingBoxSx}><CircularProgress /></Box>;
    if (error || !survey || !dynamicTheme) {
        return <Container sx={{ mt: 4 }}><Alert severity="error">{error || 'Erro inesperado.'}</Alert></Container>;
    }

    const publicUrl = `${window.location.origin}/pesquisa/${tenantId}/${survey.linkToken || pesquisaId}`;
    const primaryColor = survey.primaryColor || '#FC4C35';

    return (
        <ThemeProvider theme={dynamicTheme}>
            <Box sx={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${survey.secondaryColor || '#1EBFAE'} 100%)`,
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                p: { xs: 2, sm: 4 }
            }}>
                <Fade in={true} timeout={800}>
                    <Container maxWidth="sm">
                        <Paper elevation={10} className="print-area" sx={{
                            p: { xs: 4, sm: 6 }, borderRadius: '30px', textAlign: 'center',
                            position: 'relative', overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }}>
                            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {survey.restaurantLogoUrl ? (
                                    <Avatar
                                        src={`${process.env.REACT_APP_API_URL}${survey.restaurantLogoUrl}`}
                                        alt={survey.restaurantName || 'Logo'}
                                        sx={{ width: 100, height: 100, mb: 2, border: `3px solid ${primaryColor}`, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                    />
                                ) : (
                                    <Avatar sx={{ width: 80, height: 80, bgcolor: primaryColor, mb: 2, fontSize: '2rem', fontWeight: 'bold' }}>
                                        {survey.restaurantName?.charAt(0) || 'R'}
                                    </Avatar>
                                )}
                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', mb: 1 }}>
                                    {survey.restaurantName}
                                </Typography>
                                <Typography variant="h4" color="primary" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2 }}>
                                    {survey.title}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {survey.description || 'Sua opinião é fundamental para nós!'}
                                </Typography>
                            </Box>

                            <Box sx={{
                                p: 3, background: 'white', display: 'inline-block',
                                borderRadius: '25px', border: `2px solid ${primaryColor}22`,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                            }}>
                                <QRCode
                                    value={publicUrl}
                                    size={280}
                                    fgColor={primaryColor}
                                    aria-label="QR Code da pesquisa de satisfação"
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                />
                            </Box>

                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
                                    Aponte a câmera para avaliar
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Escaneie o QR Code e participe da nossa pesquisa de satisfação.
                                </Typography>
                            </Box>

                            <Typography variant="caption" sx={{ mt: 4, display: 'block', wordBreak: 'break-all', opacity: 0.5, fontStyle: 'italic' }}>
                                {publicUrl}
                            </Typography>

                            <Box sx={{ mt: 5 }} className="no-print">
                                <Button
                                    variant="contained"
                                    startIcon={<PrintIcon />}
                                    onClick={handlePrint}
                                    size="large"
                                    aria-label="Imprimir QR Code"
                                    sx={{ px: 4, py: 1.5, fontSize: '1.1rem', boxShadow: `0 10px 20px ${primaryColor}44` }}
                                >
                                    Imprimir QR Code
                                </Button>
                            </Box>
                        </Paper>
                    </Container>
                </Fade>

                <Box sx={{ mt: 4, pb: 2, opacity: 0.7, textAlign: 'center' }} className="no-print">
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '1px' }}>
                        TECNOLOGIA POR
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                        <img src="/logo.png" alt="Voltaki" style={{ height: '22px', filter: 'brightness(0) invert(1)' }} loading="lazy" />
                    </Box>
                </Box>

                <style>{`
                    @media print {
                        body { background: white !important; margin: 0; padding: 0; }
                        body * { visibility: hidden; }
                        .print-area, .print-area * { visibility: visible; }
                        .print-area {
                            position: absolute; left: 50%; top: 50%;
                            transform: translate(-50%, -50%);
                            width: 90%; max-width: 500px;
                            box-shadow: none !important; border: 1px solid #eee !important;
                            background: white !important; backdrop-filter: none !important;
                        }
                        .no-print { display: none !important; }
                    }
                `}</style>
            </Box>
        </ThemeProvider>
    );
};

export default SurveyPublicQrCodePage;
