import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import roletaService from '../services/roletaService';
import publicSurveyService from '../services/publicSurveyService';
import SpinTheWheel from '../components/roleta/SpinTheWheel';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../theme';

// Wrapper Component: Fetches data and provides theme
const RoulettePage = () => {
    const { tenantId, pesquisaId, clientId } = useParams();
    const [tenant, setTenant] = useState(null);
    const [survey, setSurvey] = useState(null); // Adicionar estado para a pesquisa
    const [dynamicTheme, setDynamicTheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!tenantId || !pesquisaId) {
                setLoading(false);
                setError("ID do restaurante ou da pesquisa não encontrado na URL.");
                return;
            }
            try {
                const [tenantData, surveyData] = await Promise.all([
                    publicSurveyService.getPublicTenantById(tenantId),
                    publicSurveyService.getPublicSurveyById(pesquisaId), // Buscar dados da pesquisa
                ]);
                setTenant(tenantData);
                setSurvey(surveyData);
                const theme = getDynamicTheme(tenantData.primaryColor, tenantData.secondaryColor);
                setDynamicTheme(theme);
            } catch (error) {
                console.error("Erro ao buscar dados iniciais:", error);
                setError("Não foi possível carregar as informações necessárias.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [tenantId, pesquisaId]);

    if (loading || !dynamicTheme) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!survey || !survey.roletaId) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="warning">{tenant?.name || 'O restaurante'} não configurou uma roleta para esta pesquisa.</Alert>
            </Box>
        );
    }

    return (
        <ThemeProvider theme={dynamicTheme}>
            <RouletteComponent tenant={tenant} survey={survey} />
        </ThemeProvider>
    );
};

// UI Component
const RouletteComponent = ({ tenant, survey }) => {
    const { clientId, pesquisaId } = useParams(); // Obter pesquisaId aqui
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [winningItem, setWinningItem] = useState(null);
    const [winningIndex, setWinningIndex] = useState(-1);
    const [generatedCupom, setGeneratedCupom] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchRoletaConfig = async () => {
            if (!pesquisaId || !clientId) {
                showNotification(t('roulette.error_ids_missing'), 'warning');
                setLoading(false);
                return;
            }
            try {
                const configData = await roletaService.getRoletaConfig(pesquisaId, clientId); // Passar pesquisaId
                setConfig(configData);
                setItems(configData.items || []);
            } catch (err) {
                showNotification(err.response?.data?.message || err.message || t('roulette.error_fetching_config'), 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchRoletaConfig();
    }, [pesquisaId, clientId, t, showNotification]);

    const handleSpin = async () => {
        if (!pesquisaId || !clientId) {
            showNotification(t('roulette.error_ids_missing'), 'warning');
            return;
        }
        setSpinning(true);
        try {
            const result = await roletaService.spin(pesquisaId, clientId); // Passar pesquisaId
            const wonItem = result.premio;
            const generatedCupomData = result.cupom;
            const foundIndex = items.findIndex(item => item.recompensa.name === wonItem.recompensa.name);
            if (foundIndex === -1) {
                showNotification(t('roulette.error_winning_item_not_found'), 'error');
                setSpinning(false);
                return;
            }
            setWinningItem(wonItem);
            setWinningIndex(foundIndex);
            setGeneratedCupom(generatedCupomData);
        } catch (err) {
            showNotification(err.response?.data?.message || err.message || t('roulette.error_spinning_wheel'), 'error');
            setSpinning(false);
        }
    };

    const handleAnimationComplete = () => {
        setSpinning(false);
        if (winningItem) {
            showNotification(t('roulette.win_message'), 'success');
            navigate(`/parabens`, { state: { premio: winningItem, cupom: generatedCupom, tenantId: tenant.id } });
        } else {
            console.error("Winning item is null after spin animation completes.");
            showNotification(t('roulette.error_no_winning_item'), 'error');
        }
    };

    if (loading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
    }

    if (items.length === 0) {
        return <Box sx={{ p: 4, textAlign: 'center' }}><Alert severity="warning">{t('roulette.no_items_configured')}</Alert></Box>;
    }

    return (
        <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: { xs: 1, sm: 2 } }}>
            <Box sx={{ maxWidth: '800px', width: '100%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)', overflow: 'hidden', textAlign: 'center', p: { xs: 2, sm: 4 }, margin: '0 16px' }}>
                {tenant?.logoUrl && (
                    <Box sx={{ mb: 2 }}>
                        <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt="Logo" style={{ maxHeight: '60px', maxWidth: '180px', objectFit: 'contain' }} />
                    </Box>
                )}
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>
                    {config?.title || t('roulette.title')}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {config?.description || t('roulette.description')}
                </Typography>
                <SpinTheWheel items={items} winningItem={winningItem} winningIndex={winningIndex} onAnimationComplete={handleAnimationComplete} />
                <Button variant="contained" color="primary" size="large" onClick={handleSpin} disabled={spinning || winningIndex !== -1} sx={{ mt: 4, px: 5, py: 1.5, borderRadius: '50px', fontWeight: 'bold' }}>
                    {spinning ? <CircularProgress size={24} color="inherit" /> : t('roulette.spin_button')}
                </Button>
            </Box>
        </Box>
    );
};

export default RoulettePage;
