import React, { useEffect, useState } from 'react';
import { 
    Typography, 
    Box, 
    Alert, 
    Paper, 
    CircularProgress, 
    Button, 
    Snackbar,
    Dialog,
    DialogContent,
    Fade,
    IconButton,
    Rating,
    Avatar
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Novo ícone para regras
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import StarsIcon from '@mui/icons-material/Stars';
import { useLocation } from 'react-router-dom';
import { keyframes } from '@mui/system';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import ReactConfetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import getDynamicTheme from '../getDynamicTheme';
import publicSurveyService from '../services/publicSurveyService';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const CongratulationsPage = () => {
    const location = useLocation();
    const { premio, cupom, tenantId } = location.state || {};
    const [dynamicTheme, setDynamicTheme] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tenantId) {
            publicSurveyService.getPublicTenantById(tenantId)
                .then(tenantData => {
                    setTenant(tenantData);
                    const theme = getDynamicTheme({ primaryColor: tenantData.primaryColor, secondaryColor: tenantData.secondaryColor });
                    setDynamicTheme(theme);
                })
                .catch(err => setError('Não foi possível carregar o tema da empresa.'))
                .finally(() => setLoading(false));
        } else {
            setError('ID da empresa não encontrado.');
            setLoading(false);
        }
    }, [tenantId]);

    if (loading || !dynamicTheme) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Alert severity="error">{error}</Alert></Box>;
    }

    return (
        <ThemeProvider theme={dynamicTheme}>
            <CongratulationsComponent premio={premio} cupom={cupom} tenant={tenant} />
        </ThemeProvider>
    );
};

const CongratulationsComponent = ({ premio, cupom, tenant }) => {
    const theme = useTheme();
    const { width, height } = useWindowSize();
    const [copySuccess, setCopySuccess] = useState(false);
    const [gmbOpen, setGmbOpen] = useState(false);

    useEffect(() => {
        // Abre o popup do Google após 2 segundos se houver o link
        if (tenant?.gmb_link) {
            const timer = setTimeout(() => {
                setGmbOpen(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [tenant]);

    if (!premio || !cupom) {
        return (
            <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <Box sx={{ maxWidth: '800px', width: '100%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)', overflow: 'hidden', textAlign: 'center', position: 'relative', p: 3 }}>
                    <Alert severity="error">Erro: Dados do prêmio ou cupom não encontrados.</Alert>
                </Box>
            </Box>
        );
    }
    
    const formattedValidity = formatDate(cupom.dataValidade);

    const handleCopyCode = () => {
        if (cupom.codigo) {
            navigator.clipboard.writeText(cupom.codigo);
            setCopySuccess(true);
        }
    };

    return (
        <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: { xs: 1, sm: 2 }, position: 'relative' }}>
            <ReactConfetti width={width} height={height} style={{ zIndex: 9999 }} />
            <Box sx={{ maxWidth: '800px', width: '100%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)', overflow: 'hidden', textAlign: 'center', position: 'relative', zIndex: 2, margin: { xs: '0 16px', sm: 0 } }}>
                <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, padding: { xs: '30px 20px', sm: '40px 20px' }, color: 'white', position: 'relative', zIndex: 2 }}>
                    {tenant?.logoUrl && (
                        <Box sx={{ mb: 2 }}>
                            <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt="Logo" style={{ maxHeight: '70px', maxWidth: '180px', objectFit: 'contain' }} />
                        </Box>
                    )}
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: { xs: '2rem', sm: '3rem' }, marginBottom: '10px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', fontWeight: 'bold' }}>🎉 Parabéns! 🎉</Typography>
                    <Typography variant="h5" component="h2" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, opacity: 0.9 }}>Você acaba de ganhar um prêmio especial!</Typography>
                </Box>
                <Box sx={{ padding: { xs: '20px', sm: '30px', md: '40px' }, position: 'relative', zIndex: 2 }}>
                    
                    <Paper elevation={3} sx={{ background: `linear-gradient(45deg, ${theme.palette.background.default}, ${theme.palette.grey[100]})`, borderRadius: '15px', padding: { xs: '20px', sm: '30px' }, margin: '30px 0', border: `2px dashed ${theme.palette.error.main}`, position: 'relative', animation: `${floatAnimation} 3s ease-in-out infinite` }}>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1.2rem', sm: '1.8rem' }, color: theme.palette.error.main, marginBottom: '15px' }}>Sua Recompensa:</Typography>
                        <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', fontSize: { xs: '1.8rem', sm: '2.2rem' }, color: theme.palette.primary.dark, mt: 2, mb: 2 }}>
                            {premio.nome}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Box 
                                onClick={handleCopyCode}
                                sx={{ 
                                    fontSize: { xs: '1.5rem', sm: '2.5rem' }, 
                                    fontWeight: 'bold', 
                                    background: 'white', 
                                    padding: { xs: '10px 20px', sm: '15px 30px' }, 
                                    borderRadius: '10px', 
                                    letterSpacing: '2px', 
                                    color: theme.palette.primary.main, 
                                    border: `2px solid ${theme.palette.primary.main}`, 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    '&:hover': { backgroundColor: '#f0f0f0' },
                                    wordBreak: 'break-all'
                                }}
                            >
                                {cupom.codigo}
                                <ContentCopyIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, opacity: 0.7 }} />
                            </Box>
                            <Button size="small" onClick={handleCopyCode} startIcon={<ContentCopyIcon />}>
                                Copiar Código
                            </Button>
                        </Box>

                        <Typography sx={{ mt: 2 }}>Use este código em sua próxima visita para resgatar sua recompensa.</Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, color: '#666', mb: 2 }}>
                        <CameraAltIcon fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Dica: Tire um print desta tela para não perder!</Typography>
                    </Box>

                    {premio.recompensa?.conditionDescription && (
                        <Paper elevation={0} sx={{ textAlign: 'left', p: 3, mt: 3, backgroundColor: '#fcfcfc', borderRadius: '15px', border: '1px solid #eee' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#444', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main }} />
                                Regras de Uso:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {premio.recompensa.conditionDescription.split('\n').map((line, index) => (
                                    line.trim() && (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                            <Box sx={{ minWidth: 6, height: 6, borderRadius: '50%', backgroundColor: theme.palette.primary.main, mt: 1 }} />
                                            <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.4, fontWeight: 500 }}>
                                                {line.trim()}
                                            </Typography>
                                        </Box>
                                    )
                                ))}
                            </Box>
                        </Paper>
                    )}

                    <Box sx={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '10px', margin: '20px 0', border: `1px solid ${theme.palette.error.main}` }}>
                        <Typography><strong>Validade:</strong> Este cupom é válido até <strong>{formattedValidity}</strong>.</Typography>
                    </Box>
                </Box>
                <Box sx={{ padding: '20px', backgroundColor: theme.palette.grey[100], color: theme.palette.text.secondary, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    <Typography variant="inherit">Oferta válida para o portador deste cupom. Não acumulativo com outras promoções.</Typography>
                </Box>
            </Box>

            <Snackbar
                open={copySuccess}
                autoHideDuration={3000}
                onClose={() => setCopySuccess(false)}
                message="Código copiado para a área de transferência!"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />

            {/* Popup do Google Bonitão */}
            <Dialog
                open={gmbOpen}
                onClose={() => setGmbOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        padding: 0,
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <Box sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    p: 4,
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative'
                }}>
                    <IconButton 
                        onClick={() => setGmbOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Avatar sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: 'white', 
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}>
                        <GoogleIcon sx={{ fontSize: 40, color: '#4285F4' }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                        Gostou do seu prêmio?
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Sua avaliação no Google nos ajuda muito a continuar presenteando nossos clientes!
                    </Typography>
                </Box>
                <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Avalie com 5 estrelas
                        </Typography>
                        <Rating value={5} readOnly size="large" sx={{ color: '#ffc107' }} />
                    </Box>
                    
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<StarsIcon />}
                        onClick={() => {
                            window.open(tenant.gmb_link, '_blank');
                            setGmbOpen(false);
                        }}
                        sx={{
                            borderRadius: '50px',
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            background: '#4285F4',
                            boxShadow: '0 4px 14px 0 rgba(66, 133, 244, 0.39)',
                            '&:hover': {
                                background: '#357ae8',
                                boxShadow: '0 6px 20px rgba(66, 133, 244, 0.23)',
                            }
                        }}
                    >
                        Avaliar no Google
                    </Button>
                    
                    <Button 
                        onClick={() => setGmbOpen(false)}
                        sx={{ mt: 2, color: 'text.secondary', textTransform: 'none' }}
                    >
                        Agora não, obrigado
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default CongratulationsPage;
